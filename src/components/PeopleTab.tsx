"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Upload,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  CreditCard,
  ShieldCheck,
  Mail,
  KeyRound,
  Trash2,
  X,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import type { PersonRecord, RoleRecord } from "@/types/portal";
import { TAMIL_NADU_DISTRICTS } from "@/data/districts";

interface PeopleTabProps {
  people: PersonRecord[];
  roles: RoleRecord[];
  loading: boolean;
  currentUserId: string;
  onRefresh: () => Promise<void>;
  onToast: (type: "success" | "info" | "error", text: string) => void;
}

type FilterKey = "all" | "volunteer" | "member" | "verified" | "pending" | "admin";

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "5F"
  );
}

function formatRoleLabel(roleSlug: string, roles: RoleRecord[]): string {
  const found = roles.find((r) => r.slug === roleSlug);
  if (found) return found.name;
  return roleSlug.charAt(0).toUpperCase() + roleSlug.slice(1).replace(/_/g, " ");
}

export default function PeopleTab({
  people,
  roles,
  loading,
  currentUserId,
  onRefresh,
  onToast,
}: PeopleTabProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openMenu, setOpenMenu] = useState<{
    person: PersonRecord;
    top: number;
    left: number;
    openUp: boolean;
  } | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  // Add Member Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"invite" | "create_credentials">("invite");
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addDistrict, setAddDistrict] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("volunteer");
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Bulk Upload Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const counts = useMemo(() => {
    return {
      all: people.length,
      volunteer: people.filter((p) => p.role === "volunteer").length,
      member: people.filter((p) => p.role === "member").length,
      verified: people.filter((p) => p.is_verified).length,
      pending: people.filter((p) => !p.is_verified).length,
      admin: people.filter((p) => p.role === "admin").length,
    };
  }, [people]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return people.filter((p) => {
      if (filter === "volunteer" && p.role !== "volunteer") return false;
      if (filter === "member" && p.role !== "member") return false;
      if (filter === "verified" && !p.is_verified) return false;
      if (filter === "pending" && p.is_verified) return false;
      if (filter === "admin" && p.role !== "admin") return false;
      if (!q) return true;
      return (
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone ?? "").toLowerCase().includes(q) ||
        (p.district ?? "").toLowerCase().includes(q)
      );
    });
  }, [people, search, filter]);

  const parsedBulkInvites = useMemo(() => {
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const items: { email: string; name?: string }[] = [];
    for (const line of lines) {
      const parts = line.split(/[,\t;]/).map((s) => s.trim());
      if (parts.length >= 2 && parts[1].includes("@")) {
        items.push({ name: parts[0], email: parts[1] });
      } else {
        const emailPart = parts.find((p) => p.includes("@"));
        if (emailPart) {
          items.push({ email: emailPart });
        }
      }
    }
    return items;
  }, [bulkText]);

  const handlePatchPerson = async (
    id: string,
    payload: { is_verified?: boolean; payment_completed?: boolean; role?: string },
    successMsg: string
  ) => {
    setActionBusyId(id);
    setOpenMenu(null);
    try {
      const res = await fetch(`/api/people/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onToast("error", data.error || "Failed to update user.");
        return;
      }
      onToast("success", successMsg);
      await onRefresh();
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDeletePerson = async (person: PersonRecord) => {
    setActionBusyId(person.id);
    setOpenMenu(null);
    try {
      const res = await fetch(`/api/people/${person.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onToast("error", data.error || "Failed to delete user.");
        return;
      }
      onToast("info", `Removed ${person.email}.`);
      await onRefresh();
    } finally {
      setActionBusyId(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSubmitting(true);
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: addMode,
          email: addEmail.trim(),
          fullName: addName.trim(),
          phone: addPhone.trim(),
          district: addDistrict,
          password: addPassword,
          role: addRole,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        emailResult?: { status: string; message: string };
      };
      if (!res.ok) {
        onToast("error", data.error || "Failed to add user.");
        return;
      }

      onToast(
        data.emailResult?.status === "failed" ? "error" : "success",
        data.emailResult?.message || data.message || "User added successfully."
      );
      setAddModalOpen(false);
      setAddEmail("");
      setAddName("");
      setAddPhone("");
      setAddDistrict("");
      setAddPassword("");
      await onRefresh();
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBulkInvites.length === 0) {
      onToast("error", "Please enter or upload at least one valid email address.");
      return;
    }
    setBulkSubmitting(true);
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "bulk_invite",
          invites: parsedBulkInvites,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        emailResult?: { status: string; message: string };
      };
      if (!res.ok) {
        onToast("error", data.error || "Bulk invite failed.");
        return;
      }
      onToast(
        data.emailResult?.status === "failed" ? "error" : "success",
        data.emailResult?.message || "Bulk invitation emails dispatched."
      );
      setBulkModalOpen(false);
      setBulkText("");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      if (typeof content === "string") {
        setBulkText((prev) => (prev ? `${prev}\n${content}` : content));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
            Verification &amp; Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            People
          </h1>
          <p className="text-sm text-ink-slate mt-1">
            View registered accounts, verify identities, manage paid Members vs Volunteers, or invite new users.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="pill-secondary text-xs sm:text-sm h-10 px-4 gap-2"
          >
            <Upload className="w-4 h-4 text-primary" />
            <span>Bulk upload</span>
          </button>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="pill-primary text-xs sm:text-sm h-10 px-4 gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add member</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, or district..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-white text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: "all", label: `Everyone (${counts.all})` },
              { key: "volunteer", label: `Volunteers (${counts.volunteer})` },
              { key: "member", label: `Members (${counts.member})` },
              { key: "verified", label: `Verified (${counts.verified})` },
              { key: "pending", label: `Unverified (${counts.pending})` },
              { key: "admin", label: `Admins (${counts.admin})` },
            ] as { key: FilterKey; label: string }[]
          ).map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setFilter(pill.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filter === pill.key
                  ? "bg-primary text-white border-primary shadow-2xs"
                  : "bg-white text-ink-slate border-[#dce2ea] hover:bg-[#f1f4f8]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* People Table Card */}
      <div className="bg-white rounded-modal border border-[#dce2ea] shadow-2xs overflow-visible">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-ink-steel">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading registered users...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-slate">
            No registered users match your current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#dce2ea] text-[11px] font-bold uppercase tracking-wider text-ink-steel bg-[#f9fafb]">
                  <th className="py-3.5 px-5 rounded-tl-[21px]">Person</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment / Sign-in</th>
                  <th className="py-3.5 px-5 text-right rounded-tr-[21px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce2ea] text-sm">
                {filtered.map((person) => {
                  const isBusy = actionBusyId === person.id;
                  return (
                    <tr
                      key={person.id}
                      className="hover:bg-[#f9fafb]/80 transition-colors"
                    >
                      {/* Person */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitials(person.full_name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-ink truncate">
                              {person.full_name}
                            </div>
                            <div className="text-xs text-ink-steel truncate">
                              {person.email}
                            </div>
                            {(person.district || person.phone) && (
                              <div className="text-[11px] text-ink-mute mt-0.5">
                                {[person.district, person.phone].filter(Boolean).join(" · ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role (Volunteer vs Member vs Admin/Custom) */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            person.role === "admin"
                              ? "bg-primary/10 text-primary border-primary/25"
                              : person.role === "member"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-ink-slate border-[#dce2ea]"
                          }`}
                        >
                          {formatRoleLabel(person.role, roles)}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        {person.is_verified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      {/* Payment & Sign-in */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              person.payment_completed
                                ? "text-emerald-700"
                                : "text-ink-steel"
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>
                              {person.payment_completed ? "Paid (Member)" : "Unpaid (Volunteer)"}
                            </span>
                          </span>
                          <span className="text-[11px] text-ink-mute">
                            {person.last_sign_in_at
                              ? `Last sign-in ${new Date(
                                  person.last_sign_in_at
                                ).toLocaleDateString("en-IN")}`
                              : "Waiting for first sign-in"}
                          </span>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-5 text-right">
                        {isBusy ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto" />
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              if (openMenu?.person.id === person.id) {
                                setOpenMenu(null);
                                return;
                              }
                              const rect = e.currentTarget.getBoundingClientRect();
                              const menuHeight = 148;
                              const openUp =
                                rect.bottom + menuHeight > window.innerHeight - 16;
                              setOpenMenu({
                                person,
                                top: openUp ? rect.top - 6 : rect.bottom + 6,
                                left: Math.max(12, rect.right - 208),
                                openUp,
                              });
                            }}
                            aria-label="Manage user"
                            aria-expanded={openMenu?.person.id === person.id}
                            className="w-8 h-8 rounded-full border border-[#dce2ea] bg-white hover:bg-[#f1f4f8] inline-flex items-center justify-center text-ink-slate"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fixed Action Dropdown (escapes table overflow clipping) */}
      {openMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenMenu(null)}
            aria-hidden="true"
          />
          <div
            style={{
              top: openMenu.top,
              left: openMenu.left,
              transform: openMenu.openUp ? "translateY(-100%)" : undefined,
            }}
            className="fixed w-52 bg-white rounded-2xl border border-[#dce2ea] shadow-xl py-1.5 z-50 text-left text-xs"
          >
            <button
              type="button"
              onClick={() =>
                handlePatchPerson(
                  openMenu.person.id,
                  { is_verified: !openMenu.person.is_verified },
                  openMenu.person.is_verified
                    ? `Marked ${openMenu.person.email} as unverified.`
                    : `Verified ${openMenu.person.email}.`
                )
              }
              className="w-full px-3.5 py-2 hover:bg-[#f9fafb] flex items-center gap-2 text-ink font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {openMenu.person.is_verified ? "Mark Unverified" : "Verify Account"}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handlePatchPerson(
                  openMenu.person.id,
                  { payment_completed: !openMenu.person.payment_completed },
                  openMenu.person.payment_completed
                    ? `${openMenu.person.email} set to Volunteer (Unpaid).`
                    : `${openMenu.person.email} marked Paid (Member).`
                )
              }
              className="w-full px-3.5 py-2 hover:bg-[#f9fafb] flex items-center gap-2 text-ink font-medium"
            >
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>
                {openMenu.person.payment_completed
                  ? "Set Unpaid (Volunteer)"
                  : "Mark Paid (Member)"}
              </span>
            </button>

            {openMenu.person.id !== currentUserId && (
              <button
                type="button"
                onClick={() => handleDeletePerson(openMenu.person)}
                className="w-full px-3.5 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold border-t border-[#dce2ea] mt-1 pt-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete User</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Add Member Modal (Invite Email OR Create ID & Password) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-modal border border-[#dce2ea] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce2ea] shrink-0">
              <h2 className="text-lg font-bold text-ink">Add member</h2>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-steel hover:bg-[#f1f4f8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-6 pt-4 shrink-0">
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#f1f4f8]">
                <button
                  type="button"
                  onClick={() => setAddMode("invite")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    addMode === "invite"
                      ? "bg-white text-ink shadow-2xs"
                      : "text-ink-slate hover:text-ink"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>Send Email Invite</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("create_credentials")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    addMode === "create_credentials"
                      ? "bg-white text-ink shadow-2xs"
                      : "text-ink-slate hover:text-ink"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  <span>Create ID &amp; Password</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Full Name {addMode === "create_credentials" && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  required={addMode === "create_credentials"}
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Optional for invite"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {addMode === "create_credentials" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        minLength={6}
                        value={addPassword}
                        onChange={(e) => setAddPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Role
                      </label>
                      <select
                        value={addRole}
                        onChange={(e) => setAddRole(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="volunteer">Volunteer (Unpaid)</option>
                        <option value="member">Member (Paid)</option>
                        {roles
                          .filter((r) => !["volunteer", "member"].includes(r.slug))
                          .map((r) => (
                            <option key={r.slug} value={r.slug}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={addPhone}
                        onChange={(e) => setAddPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        District
                      </label>
                      <select
                        value={addDistrict}
                        onChange={(e) => setAddDistrict(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Select district...</option>
                        {TAMIL_NADU_DISTRICTS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dce2ea]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="pill-secondary text-sm h-10 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="pill-primary text-sm h-10 px-5 gap-2"
                >
                  {addSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {addMode === "invite" ? "Send Invite Email" : "Create Account"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal (sends invitation emails alone) */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-modal border border-[#dce2ea] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce2ea] shrink-0">
              <h2 className="text-lg font-bold text-ink">Bulk upload invitations</h2>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-steel hover:bg-[#f1f4f8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <p className="text-xs text-ink-slate leading-relaxed">
                Upload a CSV/TXT file or paste email addresses below (one per line, or{" "}
                <code className="font-mono bg-[#f1f4f8] px-1 rounded">Name, email@example.com</code>).
                Each person will receive an invitation email to create their account.
              </p>

              <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-sky-50/50 hover:bg-sky-50 py-3 px-4 text-xs font-semibold text-primary cursor-pointer transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Choose CSV / TXT file</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>

              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"kavitha@example.com\nPriya S, priya@example.com"}
                className="w-full p-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />

              <div className="flex items-center justify-between pt-2 border-t border-[#dce2ea]">
                <span className="text-xs font-semibold text-ink-steel">
                  {parsedBulkInvites.length} valid email
                  {parsedBulkInvites.length === 1 ? "" : "s"} detected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="pill-secondary text-sm h-10 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkSubmitting || parsedBulkInvites.length === 0}
                    className="pill-primary text-sm h-10 px-5 gap-2 disabled:opacity-55"
                  >
                    {bulkSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span>Send Invites</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
