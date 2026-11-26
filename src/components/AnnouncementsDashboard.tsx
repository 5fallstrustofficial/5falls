"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  Trash2,
  Send,
  LogOut,
  ExternalLink,
  Mail,
  MessageSquare,
  Languages,
  Loader2,
  Menu,
  X,
  CheckCircle2,
  Database,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShieldCheck,
  Users,
  Shield,
  Calendar,
  Image as ImageIcon,
  UserCheck,
  HandHeart,
} from "lucide-react";
import type { MemberProfile } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import NewAnnouncementModal from "@/components/NewAnnouncementModal";
import PeopleTab from "@/components/PeopleTab";
import AccessControlTab from "@/components/AccessControlTab";
import UpdatesTab from "@/components/UpdatesTab";
import GalleryTab from "@/components/GalleryTab";
import TeamTab from "@/components/TeamTab";
import CrowdfundingTab from "@/components/CrowdfundingTab";
import {
  DEFAULT_SYSTEM_ROLES,
  type PersonRecord,
  type RoleRecord,
} from "@/types/portal";

export interface AnnouncementComment {
  id: number;
  announcement_id: number;
  user_id: string;
  author_name: string;
  author_role: "admin" | "member";
  body: string;
  created_at: string;
}

export interface AnnouncementItem {
  id: number;
  user_id: string;
  author_name: string;
  title: string;
  description: string;
  is_pinned: boolean;
  send_email: boolean;
  email_sent_count: number;
  email_status: "not_requested" | "sent" | "preview" | "failed";
  created_at: string;
  updated_at: string;
  comments: AnnouncementComment[];
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "5F"
  );
}

export default function AnnouncementsDashboard({
  initialProfile,
  initialTab = "announcements",
}: {
  initialProfile: MemberProfile;
  initialTab?: "announcements" | "updates" | "gallery" | "team" | "crowdfunding" | "people" | "access_control";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isTamil, toggleLanguage } = useLanguage();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [registeredUserCount, setRegisteredUserCount] = useState(0);
  const [resendConfigured, setResendConfigured] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(!initialProfile.schemaReady);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<number, boolean>>({});
  const [pinUpdating, setPinUpdating] = useState<Record<number, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; text: string } | null>(
    null
  );
  const [sqlCopied, setSqlCopied] = useState(false);

  const isAdmin = initialProfile.role === "admin";

  const activeTab: "announcements" | "updates" | "gallery" | "team" | "crowdfunding" | "people" | "access_control" = useMemo(() => {
    if (!isAdmin) return "announcements";
    if (pathname?.startsWith("/dashboard/updates")) return "updates";
    if (pathname?.startsWith("/dashboard/gallery")) return "gallery";
    if (pathname?.startsWith("/dashboard/team")) return "team";
    if (pathname?.startsWith("/dashboard/crowdfunding")) return "crowdfunding";
    if (pathname?.startsWith("/dashboard/people")) return "people";
    if (pathname?.startsWith("/dashboard/access-control")) return "access_control";
    return initialTab;
  }, [pathname, isAdmin, initialTab]);

  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set([activeTab]));
  const announcementsFetchedRef = useRef(false);
  const peopleFetchedRef = useRef(false);

  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>(DEFAULT_SYSTEM_ROLES);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [rolesSchemaNeedsUpdate, setRolesSchemaNeedsUpdate] = useState(false);

  const fetchPeopleAndRoles = async () => {
    if (!isAdmin) return;
    setPeopleLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        fetch("/api/people"),
        fetch("/api/roles"),
      ]);
      if (pRes.ok) {
        const pData = (await pRes.json()) as { people?: PersonRecord[] };
        setPeople(pData.people ?? []);
      }
      if (rRes.ok) {
        const rData = (await rRes.json()) as {
          roles?: RoleRecord[];
          schemaNeedsUpdate?: boolean;
        };
        if (rData.roles) setRoles(rData.roles);
        setRolesSchemaNeedsUpdate(Boolean(rData.schemaNeedsUpdate));
      }
    } finally {
      setPeopleLoading(false);
    }
  };

  const showToast = (type: "success" | "info" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 5500);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as {
          schemaMissing?: boolean;
          announcements?: AnnouncementItem[];
          registeredUserCount?: number;
          resendConfigured?: boolean;
        };
        setSchemaMissing(Boolean(data.schemaMissing));
        setAnnouncements(data.announcements ?? []);
        setRegisteredUserCount(data.registeredUserCount ?? 0);
        setResendConfigured(Boolean(data.resendConfigured));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });

    if (!isAdmin && pathname && pathname !== "/dashboard") {
      router.replace("/dashboard");
      return;
    }

    if (activeTab === "announcements" && !announcementsFetchedRef.current) {
      announcementsFetchedRef.current = true;
      fetchAnnouncements();
    }

    if (
      isAdmin &&
      (activeTab === "people" || activeTab === "access_control") &&
      !peopleFetchedRef.current
    ) {
      peopleFetchedRef.current = true;
      fetchPeopleAndRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdmin, pathname]);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? announcements.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.author_name.toLowerCase().includes(q)
        )
      : announcements;

    return [...list].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [announcements, searchQuery]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleCreateAnnouncement = async (payload: {
    title: string;
    description: string;
    isPinned: boolean;
    sendEmail: boolean;
  }): Promise<string | null> => {
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        announcement?: AnnouncementItem;
        emailResult?: { status: string; sentCount: number; message: string } | null;
      };

      if (!res.ok || !data.announcement) {
        return data.error || "Failed to publish announcement.";
      }

      setAnnouncements((prev) => [data.announcement!, ...prev]);

      if (data.emailResult) {
        showToast(
          data.emailResult.status === "failed" ? "error" : "success",
          data.emailResult.message
        );
      } else {
        showToast(
          "success",
          isTamil ? "அறிவிப்பு வெளியிடப்பட்டது." : "Announcement published."
        );
      }

      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Failed to publish announcement.";
    }
  };

  const handleTogglePin = async (item: AnnouncementItem) => {
    if (!isAdmin) return;
    setPinUpdating((prev) => ({ ...prev, [item.id]: true }));
    try {
      const nextPinned = !item.is_pinned;
      const res = await fetch(`/api/announcements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: nextPinned }),
      });
      if (res.ok) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, is_pinned: nextPinned } : a))
        );
        showToast(
          "info",
          nextPinned ? "Announcement pinned to top." : "Announcement unpinned."
        );
      }
    } finally {
      setPinUpdating((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!isAdmin) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setConfirmDeleteId(null);
        showToast("info", "Announcement deleted.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddComment = async (announcementId: number) => {
    const body = (commentDrafts[announcementId] ?? "").trim();
    if (!body) return;

    setCommentSubmitting((prev) => ({ ...prev, [announcementId]: true }));
    try {
      const res = await fetch(`/api/announcements/${announcementId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      if (res.ok) {
        const { comment } = (await res.json()) as { comment: AnnouncementComment };
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === announcementId
              ? { ...a, comments: [...a.comments, comment] }
              : a
          )
        );
        setCommentDrafts((prev) => ({ ...prev, [announcementId]: "" }));
      }
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [announcementId]: false }));
    }
  };

  const handleDeleteComment = async (announcementId: number, commentId: number) => {
    const res = await fetch(
      `/api/announcements/${announcementId}/comments?commentId=${commentId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcementId
            ? { ...a, comments: a.comments.filter((c) => c.id !== commentId) }
            : a
        )
      );
    }
  };

  const handleCopyPromoteSql = () => {
    const sql = [
      "grant usage on schema public to authenticated, service_role;",
      "grant all privileges on public.profiles, public.user_roles, public.announcements, public.announcement_comments to service_role;",
      "grant all privileges on all sequences in schema public to service_role;",
      `insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = '${initialProfile.email}' on conflict (user_id) do update set role = 'admin';`,
    ].join("\n");
    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-2 py-2 mb-6">
          <Link href="/" className="relative h-8 w-32 block">
            <Image
              src="/img/logo-navy.png"
              alt="5Falls Trust"
              fill
              className="object-contain object-left"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-ink-steel hover:bg-[#f1f4f8]"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Nav */}
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
              {isTamil ? "பணியிடம்" : "Workspace"}
            </div>
            <Link
              href="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "announcements"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-ink-slate hover:bg-[#f1f4f8] hover:text-ink border border-transparent"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4" />
                <span>{isTamil ? "அறிவிப்புகள்" : "Announcements"}</span>
              </span>
              {announcements.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-primary border border-primary/20">
                  {announcements.length}
                </span>
              )}
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/dashboard/updates"
                  onClick={() => setMobileNavOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === "updates"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-ink-slate hover:bg-[#f1f4f8] hover:text-ink border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" />
                    <span>{isTamil ? "களப் பதிவுகள்" : "Updates"}</span>
                  </span>
                </Link>

                <Link
                  href="/dashboard/gallery"
                  onClick={() => setMobileNavOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === "gallery"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-ink-slate hover:bg-[#f1f4f8] hover:text-ink border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>{isTamil ? "கேலரி" : "Gallery"}</span>
                  </span>
                </Link>

                <Link
                  href="/dashboard/team"
                  onClick={() => setMobileNavOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === "team"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-ink-slate hover:bg-[#f1f4f8] hover:text-ink border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4" />
                    <span>{isTamil ? "குழு" : "Team"}</span>
                  </span>
                </Link>

                <Link
                  href="/dashboard/crowdfunding"
                  onClick={() => setMobileNavOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === "crowdfunding"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-ink-slate hover:bg-[#f1f4f8] hover:text-ink border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <HandHeart className="w-4 h-4" />
                    <span>{isTamil ? "நிதி திரட்டல்" : "Crowdfunding"}</span>
                  </span>
                </Link>
              </>
            )}
          </div>

          {isAdmin && (
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                Verification
              </div>
              <Link
                href="/dashboard/people"
                onClick={() => setMobileNavOpen(false)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === "people"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-ink-slate hover:bg-[#f1f4f8] hover:text-ink border border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>People</span>
                </span>
                {people.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-ink-slate border border-[#dce2ea]">
                    {people.length}
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/access-control"
                onClick={() => setMobileNavOpen(false)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === "access_control"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-ink-slate hover:bg-[#f1f4f8] hover:text-ink border border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4" />
                  <span>Access control</span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Bottom Controls & User Identity */}
      <div className="space-y-3 pt-4 border-t border-[#dce2ea]">
        <Link
          href="/"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-slate hover:bg-[#f1f4f8] hover:text-ink transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{isTamil ? "பொது இணையதளம்" : "Back to 5falls.org"}</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isTamil ? "வெளியேறு" : "Sign out"}</span>
        </button>

        {/* Active User Card */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#f9fafb] border border-[#dce2ea]">
          <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
            {getInitials(initialProfile.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-ink truncate">{initialProfile.full_name}</div>
            <div className="text-[11px] text-ink-steel flex items-center gap-1.5">
              <span className="capitalize font-semibold text-primary">
                {isAdmin ? "Admin" : "Member"}
              </span>
              {initialProfile.district && (
                <>
                  <span>·</span>
                  <span className="truncate">{initialProfile.district}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9fafb] text-ink flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-[#dce2ea] sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white border-r border-[#dce2ea] h-full z-10 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#dce2ea] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#dce2ea] bg-white text-ink hover:bg-[#f1f4f8]"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isTamil ? "அறிவிப்புகளைத் தேடு..." : "Search announcements..."
                }
                className="w-full h-9 pl-9 pr-14 rounded-full border border-[#dce2ea] bg-[#f9fafb] text-xs sm:text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-ink-steel bg-white border border-[#dce2ea] rounded">
                Ctrl K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isAdmin
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-sky-50 text-primary border-sky-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAdmin ? "Admin Access" : "Member Portal"}</span>
            </span>

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#dce2ea] bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:border-primary/40 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-primary" />
              <span>{isTamil ? "English" : "தமிழ்"}</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Container */}
        <main
          className={`flex-1 px-4 sm:px-8 py-8 w-full mx-auto space-y-6 ${
            activeTab === "announcements" ? "max-w-4xl" : "max-w-5xl"
          }`}
        >
          {/* Toast Notification */}
          {toast && (
            <div
              className={`rounded-2xl border px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-sm ${
                toast.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-sky-50 border-sky-200 text-ink"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{toast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs font-bold opacity-70 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Setup Notice when Supabase schema hasn't been executed in SQL Editor yet */}
          {schemaMissing && (
            <div className="rounded-modal border border-amber-200 bg-amber-50 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm text-amber-900">
                  <p className="font-bold">
                    Database Tables or Service Role Grants Required in Supabase
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Your account is authenticated with Supabase, and the database still needs the SQL files in{" "}
                    <code className="font-mono bg-white px-1.5 py-0.5 rounded">supabase/schemas/</code>{" "}
                    (01 through 05, including <code className="font-mono bg-white px-1.5 py-0.5 rounded">service_role</code> table grants).
                    Run them in order in your Supabase SQL Editor, then click Retry Connection.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-8">
                <button
                  type="button"
                  onClick={handleCopyPromoteSql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {sqlCopied ? "Copied Admin SQL!" : "Copy SQL to make yourself Admin"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={fetchAnnouncements}
                  className="pill-primary text-xs h-8 px-4"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          {/* Member Dashboard "Coming Soon" Banner (shown to regular members after registration/payment) */}
          {!isAdmin && (
            <div className="bg-white rounded-modal border border-[#dce2ea] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  <span>{isTamil ? "விரைவில் வருகிறது" : "Member Dashboard · Coming Soon"}</span>
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-ink">
                  {isTamil
                    ? `வணக்கம் ${initialProfile.full_name}, விரைவில் உங்கள் உறுப்பினர் வசதிகள் இணைக்கப்படும்`
                    : `Welcome, ${initialProfile.full_name} — Full Member Tools Coming Soon`}
                </h2>
                <p className="text-xs sm:text-sm text-ink-slate max-w-2xl leading-relaxed">
                  {isTamil
                    ? "உங்கள் 80G நன்கொடை ரசீதுகள், களப் பணி வருகைப் பதிவுகள் மற்றும் மாவட்ட வாரியான திட்ட விவரங்கள் விரைவில் இங்கே கிடைக்கும். கீழே அறக்கட்டளை அறிவிப்புகளைப் பார்த்து கருத்து தெரிவிக்கலாம்."
                    : "Volunteer attendance tracking, 80G donation receipts, and district project reports are coming soon. Meanwhile, read official Trust announcements below and join the discussion."}
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f9fafb] border border-[#dce2ea] text-xs font-semibold text-ink-slate">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>{initialProfile.district || "Member"}</span>
                </span>
              </div>
            </div>
          )}

          {/* Tab: Updates (Admins only, keep-alive once visited) */}
          {isAdmin && visitedTabs.has("updates") && (
            <div className={activeTab === "updates" ? "block" : "hidden"}>
              <UpdatesTab onToast={showToast} />
            </div>
          )}

          {/* Tab: Gallery (Admins only, keep-alive once visited) */}
          {isAdmin && visitedTabs.has("gallery") && (
            <div className={activeTab === "gallery" ? "block" : "hidden"}>
              <GalleryTab onToast={showToast} />
            </div>
          )}

          {/* Tab: Team (Admins only, keep-alive once visited) */}
          {isAdmin && visitedTabs.has("team") && (
            <div className={activeTab === "team" ? "block" : "hidden"}>
              <TeamTab onToast={showToast} />
            </div>
          )}

          {/* Tab: Crowdfunding (Admins only, keep-alive once visited) */}
          {isAdmin && visitedTabs.has("crowdfunding") && (
            <div className={activeTab === "crowdfunding" ? "block" : "hidden"}>
              <CrowdfundingTab onToast={showToast} />
            </div>
          )}

          {/* Tab: People (Admins only, keep-alive once visited) */}
          {isAdmin && visitedTabs.has("people") && (
            <div className={activeTab === "people" ? "block" : "hidden"}>
              <PeopleTab
                people={people}
                roles={roles}
                loading={peopleLoading}
                currentUserId={initialProfile.id}
                onRefresh={fetchPeopleAndRoles}
                onToast={showToast}
              />
            </div>
          )}

          {/* Tab: Access Control (Admins only, keep-alive once visited) */}
          {isAdmin && visitedTabs.has("access_control") && (
            <div className={activeTab === "access_control" ? "block" : "hidden"}>
              <AccessControlTab
                people={people}
                roles={roles}
                schemaNeedsUpdate={rolesSchemaNeedsUpdate}
                onRefresh={fetchPeopleAndRoles}
                onToast={showToast}
              />
            </div>
          )}

          {/* Tab: Announcements */}
          {activeTab === "announcements" && (
            <>
              {/* Announcements Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
                {isTamil ? "ஐந்தருவி அறக்கட்டளை" : "Five Falls Trust"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                {isTamil ? "அறிவிப்புகள்" : "Announcements"}
              </h1>
              <p className="text-sm text-ink-slate mt-1">
                {isTamil
                  ? "அனைத்து உறுப்பினர்களுக்கும் உடனடி மின்னஞ்சல் அறிவிப்புகள் மற்றும் களத் தகவல்கள்."
                  : "Trust updates, lake restoration briefings, and member-wide email notices."}
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsNewModalOpen(true)}
                className="pill-primary text-sm h-10 px-5 gap-1.5 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isTamil ? "புதிய அறிவிப்பு" : "New announcement"}</span>
              </button>
            )}
          </div>

          {/* Announcements Feed */}
          {loading ? (
            <div className="bg-white rounded-modal border border-[#dce2ea] p-12 flex flex-col items-center justify-center text-ink-steel gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading announcements...</span>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="bg-white rounded-modal border border-[#dce2ea] p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-primary flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-ink">
                {searchQuery
                  ? "No announcements match your search"
                  : isTamil
                  ? "இதுவரை அறிவிப்புகள் இல்லை"
                  : "No announcements published yet"}
              </h3>
              <p className="text-xs sm:text-sm text-ink-slate max-w-md mx-auto">
                {isAdmin
                  ? "Click '+ New announcement' to broadcast an update and optionally send email notifications to every registered user."
                  : "Official Trust updates and lake restoration notices posted by administrators will appear right here."}
              </p>
              {isAdmin && !searchQuery && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(true)}
                    className="pill-primary text-sm h-9 px-5 gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Announcement</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((item) => (
                <article
                  key={item.id}
                  className={`bg-white rounded-modal border transition-all p-5 sm:p-6 shadow-2xs ${
                    item.is_pinned
                      ? "border-primary/35 ring-1 ring-primary/10"
                      : "border-[#dce2ea]"
                  }`}
                >
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.is_pinned && (
                          <Pin className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                        )}
                        <h2 className="text-base sm:text-lg font-bold text-ink leading-snug">
                          {item.title}
                        </h2>
                        {item.is_pinned && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                            Pinned
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-steel">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                            {getInitials(item.author_name)}
                          </span>
                          <span className="font-semibold text-ink">{item.author_name}</span>
                        </span>
                        <span>·</span>
                        <span>{formatRelativeTime(item.created_at)}</span>

                        {item.send_email && (
                          <>
                            <span>·</span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                item.email_status === "sent"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : item.email_status === "failed"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-sky-50 text-primary border-sky-200"
                              }`}
                            >
                              <Mail className="w-3 h-3" />
                              <span>
                                {item.email_status === "sent"
                                  ? `Emailed ${item.email_sent_count} user${
                                      item.email_sent_count === 1 ? "" : "s"
                                    }`
                                  : item.email_status === "failed"
                                  ? "Email dispatch issue"
                                  : `Email preview (${item.email_sent_count} user${
                                      item.email_sent_count === 1 ? "" : "s"
                                    })`}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Admin Controls: Pin & Delete */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={Boolean(pinUpdating[item.id])}
                          onClick={() => handleTogglePin(item)}
                          className={`h-8 px-3 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                            item.is_pinned
                              ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                              : "bg-[#f9fafb] border-[#dce2ea] text-ink-slate hover:bg-[#f1f4f8] hover:text-ink"
                          }`}
                        >
                          <Pin
                            className={`w-3.5 h-3.5 ${
                              item.is_pinned ? "fill-amber-500 text-amber-600" : ""
                            }`}
                          />
                          <span>{item.is_pinned ? "Pinned" : "Pin"}</span>
                        </button>

                        {confirmDeleteId === item.id ? (
                          <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-full p-0.5 pl-2.5">
                            <span className="text-[11px] font-semibold text-red-700">
                              Delete?
                            </span>
                            <button
                              type="button"
                              disabled={deletingId === item.id}
                              onClick={() => handleDeleteAnnouncement(item.id)}
                              className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold hover:bg-red-700"
                            >
                              {deletingId === item.id ? "..." : "Yes"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-full text-[11px] font-semibold text-ink-slate hover:text-ink"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label="Delete announcement"
                            className="w-8 h-8 rounded-full border border-[#dce2ea] bg-[#f9fafb] text-ink-steel hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description / Message Body */}
                  <div className="mt-4 text-sm text-ink-slate leading-relaxed whitespace-pre-wrap">
                    {item.description}
                  </div>

                  {/* Comments Thread */}
                  <div className="mt-5 pt-4 border-t border-[#dce2ea] space-y-3">
                    {item.comments.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-steel">
                          <MessageSquare className="w-3.5 h-3.5 text-primary" />
                          <span>
                            {item.comments.length}{" "}
                            {item.comments.length === 1 ? "Comment" : "Comments"}
                          </span>
                        </div>
                        {item.comments.map((comment) => {
                          const canDeleteComment =
                            isAdmin || comment.user_id === initialProfile.id;
                          return (
                            <div
                              key={comment.id}
                              className="rounded-xl bg-[#f9fafb] border border-[#dce2ea] px-3.5 py-2.5 flex items-start justify-between gap-3"
                            >
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                  <span className="font-bold text-ink">
                                    {comment.author_name}
                                  </span>
                                  {comment.author_role === "admin" && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                      Admin
                                    </span>
                                  )}
                                  <span className="text-ink-mute">
                                    · {formatRelativeTime(comment.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-ink-slate leading-relaxed whitespace-pre-wrap">
                                  {comment.body}
                                </p>
                              </div>

                              {canDeleteComment && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(item.id, comment.id)}
                                  aria-label="Delete comment"
                                  className="text-ink-mute hover:text-red-600 p-1 shrink-0 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Comment Composer */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddComment(item.id);
                      }}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={commentDrafts[item.id] ?? ""}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder={
                          isTamil
                            ? "கருத்தைச் சேர்க்கவும்... (Enter அழுத்தவும்)"
                            : "Add a comment... (Enter to post)"
                        }
                        className="flex-1 h-10 px-4 rounded-full border border-[#dce2ea] bg-[#f9fafb] text-xs sm:text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <button
                        type="submit"
                        disabled={
                          Boolean(commentSubmitting[item.id]) ||
                          !(commentDrafts[item.id] ?? "").trim()
                        }
                        className="h-10 px-4 rounded-full border border-[#dce2ea] bg-white hover:bg-primary hover:text-white hover:border-primary text-xs sm:text-sm font-semibold text-ink inline-flex items-center gap-1.5 transition-all disabled:opacity-45 disabled:pointer-events-none shrink-0"
                      >
                        {commentSubmitting[item.id] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{isTamil ? "பதிவிடு" : "Post"}</span>
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {/* Create Announcement Modal (Admins only) */}
      <NewAnnouncementModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        registeredUserCount={registeredUserCount}
        resendConfigured={resendConfigured}
        onSubmit={handleCreateAnnouncement}
      />
    </div>
  );
}
