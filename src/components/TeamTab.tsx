"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Loader2,
  Database,
  ExternalLink,
  Upload,
  UserCheck,
  Globe,
} from "lucide-react";
import { InstagramIcon } from "@/components/Icons";
import type { TeamMember, TeamSocials } from "@/data/teamData";

interface TeamTabProps {
  onToast: (type: "success" | "info" | "error", text: string) => void;
}

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

export default function TeamTab({ onToast }: TeamTabProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");
  const [website, setWebsite] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = (await res.json()) as {
          schemaMissing?: boolean;
          members?: TeamMember[];
        };
        setSchemaMissing(Boolean(data.schemaMissing));
        setMembers(data.members ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setRoleTitle("");
    setDescription("");
    setImageUrl("");
    setInstagram("");
    setLinkedin("");
    setTwitter("");
    setFacebook("");
    setWebsite("");
    setModalOpen(true);
  };

  const openEditModal = (m: TeamMember) => {
    setEditingId(m.id);
    setName(m.name);
    setRoleTitle(m.roleTitle ?? "");
    setDescription(m.description);
    setImageUrl(m.imageUrl ?? "");
    setInstagram(m.socials?.instagram ?? "");
    setLinkedin(m.socials?.linkedin ?? "");
    setTwitter(m.socials?.twitter ?? "");
    setFacebook(m.socials?.facebook ?? "");
    setWebsite(m.socials?.website ?? "");
    setModalOpen(true);
  };

  const handleUploadImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/team/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        onToast("error", data.error || "Failed to upload photo.");
        return;
      }
      setImageUrl(data.url);
      onToast("success", "Photo uploaded.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      onToast("error", "Name and Description are required.");
      return;
    }

    const socials: TeamSocials = {};
    if (instagram.trim()) socials.instagram = instagram.trim();
    if (linkedin.trim()) socials.linkedin = linkedin.trim();
    if (twitter.trim()) socials.twitter = twitter.trim();
    if (facebook.trim()) socials.facebook = facebook.trim();
    if (website.trim()) socials.website = website.trim();

    setSubmitting(true);
    try {
      const url = editingId ? `/api/team/${editingId}` : "/api/team";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          roleTitle: roleTitle.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          socials,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onToast("error", data.error || "Could not save team member.");
        return;
      }
      onToast(
        "success",
        editingId ? "Team member updated." : "Team member added."
      );
      setModalOpen(false);
      await loadTeam();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        onToast("error", data.error || "Failed to delete team member.");
        return;
      }
      setConfirmDeleteId(null);
      onToast("success", "Team member removed.");
      await loadTeam();
    } finally {
      setDeletingId(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= members.length || reordering) return;

    const updated = [...members];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setMembers(updated);

    setReordering(true);
    try {
      const res = await fetch("/api/team/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: updated.map((m) => m.id) }),
      });
      if (!res.ok) {
        onToast("error", "Could not save new arrangement.");
        await loadTeam();
      } else {
        onToast("success", "Team order updated.");
      }
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
            About Page · Leadership &amp; Team
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Team Members
          </h1>
          <p className="text-sm text-ink-slate mt-1">
            Add, edit, or arrange team members displayed below the About section on{" "}
            <a
              href="/about#team"
              target="_blank"
              rel="noreferrer"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              /about#team <ExternalLink className="w-3 h-3" />
            </a>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={schemaMissing}
          className="pill-primary text-sm h-10 px-5 gap-1.5 shadow-sm shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add team member</span>
        </button>
      </div>

      {schemaMissing && (
        <div className="rounded-modal border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Run `08_team.sql` in Supabase SQL Editor</p>
            <p className="text-amber-800 mt-0.5">
              Run{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded">
                supabase/schemas/08_team.sql
              </code>{" "}
              to create <code className="font-mono">public.team_members</code> and the{" "}
              <code className="font-mono">team-media</code> bucket.
            </p>
          </div>
        </div>
      )}

      {/* Team Members List */}
      {loading ? (
        <div className="bg-white rounded-modal border border-[#dce2ea] p-12 flex flex-col items-center justify-center gap-3 text-ink-steel">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading team members...</span>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-modal border border-[#dce2ea] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ink">No team members added yet</h3>
          <p className="text-sm text-ink-slate max-w-md mx-auto">
            Add trustees, coordinators, or volunteers to showcase them in the Team section on the About page.
          </p>
          {!schemaMissing && (
            <button
              type="button"
              onClick={openCreateModal}
              className="pill-primary text-xs h-9 px-4 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add first member</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member, idx) => {
            const socialLinks = [
              { key: "instagram", url: member.socials?.instagram, icon: InstagramIcon, label: "Instagram" },
              { key: "linkedin", url: member.socials?.linkedin, icon: ExternalLink, label: "LinkedIn" },
              { key: "facebook", url: member.socials?.facebook, icon: ExternalLink, label: "Facebook" },
              { key: "twitter", url: member.socials?.twitter, icon: ExternalLink, label: "X / Twitter" },
              { key: "website", url: member.socials?.website, icon: Globe, label: "Website" },
            ].filter((s) => Boolean(s.url));

            return (
              <div
                key={member.id}
                className="bg-white rounded-modal border border-[#dce2ea] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Order Controls */}
                  <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0 || reordering}
                      onClick={() => handleMove(idx, -1)}
                      aria-label="Move up"
                      title="Move up"
                      className="w-7 h-7 rounded-lg border border-[#dce2ea] bg-[#f9fafb] hover:bg-[#f1f4f8] flex items-center justify-center text-ink-slate disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-ink-mute">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === members.length - 1 || reordering}
                      onClick={() => handleMove(idx, 1)}
                      aria-label="Move down"
                      title="Move down"
                      className="w-7 h-7 rounded-lg border border-[#dce2ea] bg-[#f9fafb] hover:bg-[#f1f4f8] flex items-center justify-center text-ink-slate disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Avatar / Photo */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#dce2ea] bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{getInitials(member.name)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-ink truncate">
                        {member.name}
                      </h3>
                      {member.roleTitle && (
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                          {member.roleTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-ink-slate line-clamp-2 leading-relaxed">
                      {member.description}
                    </p>
                    {socialLinks.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {socialLinks.map((s) => {
                          const Icon = s.icon;
                          return (
                            <a
                              key={s.key}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f9fafb] border border-[#dce2ea] text-[11px] font-medium text-ink-slate hover:text-primary hover:border-primary/40"
                            >
                              <Icon className="w-3 h-3" />
                              <span>{s.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => openEditModal(member)}
                    className="h-8 px-3 rounded-full border border-[#dce2ea] bg-[#f9fafb] hover:bg-[#f1f4f8] text-xs font-semibold text-ink inline-flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5 text-primary" />
                    <span>Edit</span>
                  </button>

                  {confirmDeleteId === member.id ? (
                    <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-full p-0.5 pl-2.5">
                      <span className="text-[11px] font-semibold text-red-700">
                        Delete?
                      </span>
                      <button
                        type="button"
                        disabled={deletingId === member.id}
                        onClick={() => handleDelete(member.id)}
                        className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold hover:bg-red-700"
                      >
                        {deletingId === member.id ? "..." : "Yes"}
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
                      onClick={() => setConfirmDeleteId(member.id)}
                      aria-label="Delete team member"
                      className="w-8 h-8 rounded-full border border-[#dce2ea] bg-[#f9fafb] text-ink-steel hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Team Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-modal border border-[#dce2ea] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce2ea] shrink-0">
              <h2 className="text-lg font-bold text-ink">
                {editingId ? "Edit team member" : "Add team member"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-steel hover:bg-[#f1f4f8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              data-lenis-prevent
              className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. K. Meenakshi"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Role / Designation (Optional)
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Managing Trustee"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short bio, responsibilities, or background..."
                  className="w-full p-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Photo Upload / URL */}
              <div className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">
                    Profile Photo
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#dce2ea] hover:border-primary/40 text-xs font-semibold text-primary cursor-pointer">
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadImage(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste photo URL (https://...)"
                  className="w-full h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                />

                {imageUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={imageUrl}
                      alt={name || "Preview"}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#dce2ea]"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              <div className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4 space-y-3">
                <span className="block text-xs font-bold text-ink">
                  Social Media Links (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Instagram URL"
                    className="h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                  />
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="LinkedIn URL"
                    className="h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                  />
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="X / Twitter URL"
                    className="h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                  />
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="Facebook URL"
                    className="h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                  />
                </div>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Personal Website / Portfolio URL"
                  className="w-full h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dce2ea]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="pill-secondary text-sm h-10 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="pill-primary text-sm h-10 px-5 gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingId ? "Save changes" : "Add member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
