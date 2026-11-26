"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ImagePlus,
  Video,
  X,
  Loader2,
  Database,
  ExternalLink,
  HandHeart,
  MapPin,
} from "lucide-react";
import {
  formatInr,
  type CrowdfundingCampaign,
  type CrowdfundingMediaImage,
} from "@/data/crowdfundingData";

interface CrowdfundingTabProps {
  onToast: (type: "success" | "info" | "error", text: string) => void;
}

const STATUS_BADGES: Record<
  CrowdfundingCampaign["status"],
  { label: string; cls: string }
> = {
  active: {
    label: "Active",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  completed: {
    label: "Funded",
    cls: "bg-primary/10 text-primary border-primary/20",
  },
  paused: {
    label: "Paused",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default function CrowdfundingTab({ onToast }: CrowdfundingTabProps) {
  const [campaigns, setCampaigns] = useState<CrowdfundingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [personName, setPersonName] = useState("");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [location, setLocation] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [raisedAmount, setRaisedAmount] = useState("0");
  const [status, setStatus] = useState<"active" | "completed" | "paused">("active");
  const [upiId, setUpiId] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [images, setImages] = useState<CrowdfundingMediaImage[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crowdfunding");
      if (res.ok) {
        const data = (await res.json()) as {
          schemaMissing?: boolean;
          campaigns?: CrowdfundingCampaign[];
        };
        setSchemaMissing(Boolean(data.schemaMissing));
        setCampaigns(data.campaigns ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.personName.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.story.toLowerCase().includes(q) ||
        (c.location?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [campaigns, search, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setPersonName("");
    setTitle("");
    setStory("");
    setLocation("");
    setTargetAmount("");
    setRaisedAmount("0");
    setStatus("active");
    setUpiId("");
    setContactPhone("");
    setImages([]);
    setImageUrlInput("");
    setVideoSrc("");
    setModalOpen(true);
  };

  const openEditModal = (c: CrowdfundingCampaign) => {
    setEditingId(c.id);
    setPersonName(c.personName);
    setTitle(c.title);
    setStory(c.story);
    setLocation(c.location ?? "");
    setTargetAmount(String(c.targetAmount));
    setRaisedAmount(String(c.raisedAmount));
    setStatus(c.status);
    setUpiId(c.upiId ?? "");
    setContactPhone(c.contactPhone ?? "");
    setImages(c.images ?? []);
    setImageUrlInput("");
    setVideoSrc(c.video?.src ?? "");
    setModalOpen(true);
  };

  const handleFileUpload = async (
    files: FileList | null,
    expectedType: "image" | "video"
  ) => {
    if (!files || files.length === 0) return;
    setUploadingMedia(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/crowdfunding/upload", {
          method: "POST",
          body: fd,
        });
        const data = (await res.json()) as {
          url?: string;
          mediaType?: "image" | "video";
          name?: string;
          error?: string;
        };
        if (!res.ok || !data.url) {
          onToast("error", data.error || `Failed to upload ${file.name}.`);
          continue;
        }
        if (expectedType === "image" && data.mediaType === "image") {
          setImages((prev) => [
            ...prev,
            {
              src: data.url!,
              alt: personName.trim() || title.trim() || data.name || "Campaign photo",
            },
          ]);
        } else if (expectedType === "video" && data.mediaType === "video") {
          setVideoSrc(data.url);
        }
      }
      onToast("success", "Media uploaded.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImages((prev) => [
      ...prev,
      { src: url, alt: personName.trim() || title.trim() || "Campaign photo" },
    ]);
    setImageUrlInput("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = Number(targetAmount);
    const raisedNum = Math.max(0, Number(raisedAmount) || 0);

    if (!personName.trim() || !title.trim() || !story.trim() || !Number.isFinite(targetNum) || targetNum <= 0) {
      onToast("error", "Person Name, Title, Story, and a valid Amount Needed (> 0) are required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/crowdfunding/${editingId}` : "/api/crowdfunding";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personName: personName.trim(),
          title: title.trim(),
          story: story.trim(),
          location: location.trim(),
          targetAmount: targetNum,
          raisedAmount: raisedNum,
          status,
          upiId: upiId.trim(),
          contactPhone: contactPhone.trim(),
          images,
          video: videoSrc.trim() ? { src: videoSrc.trim() } : null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onToast("error", data.error || "Could not save campaign.");
        return;
      }
      onToast(
        "success",
        editingId ? "Campaign updated." : "Campaign published to /crowdfunding."
      );
      setModalOpen(false);
      await loadCampaigns();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/crowdfunding/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        onToast("error", data.error || "Failed to delete campaign.");
        return;
      }
      setConfirmDeleteId(null);
      onToast("success", "Campaign deleted.");
      await loadCampaigns();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
            Community Support · Fundraising
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Crowdfunding
          </h1>
          <p className="text-sm text-ink-slate mt-1">
            Post verified cases for individuals needing financial support, live on{" "}
            <a
              href="/crowdfunding"
              target="_blank"
              rel="noreferrer"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              /crowdfunding <ExternalLink className="w-3 h-3" />
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
          <span>Add campaign</span>
        </button>
      </div>

      {schemaMissing && (
        <div className="rounded-modal border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Run `09_crowdfunding.sql` in Supabase SQL Editor</p>
            <p className="text-amber-800 mt-0.5">
              Run{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded">
                supabase/schemas/09_crowdfunding.sql
              </code>{" "}
              to create <code className="font-mono">public.crowdfunding_campaigns</code> and the{" "}
              <code className="font-mono">crowdfunding-media</code> bucket.
            </p>
          </div>
        </div>
      )}

      {/* Search & Status Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by person name, title, or location..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-white text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "completed", label: "Funded" },
            { id: "paused", label: "Paused" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                statusFilter === s.id
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-ink-slate border-[#dce2ea] hover:bg-[#f1f4f8]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="bg-white rounded-modal border border-[#dce2ea] p-12 flex flex-col items-center justify-center gap-3 text-ink-steel">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading crowdfunding campaigns...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-modal border border-[#dce2ea] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <HandHeart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ink">No crowdfunding campaigns yet</h3>
          <p className="text-sm text-ink-slate max-w-md mx-auto">
            Add a campaign with the person&apos;s details, target amount, photos, and optional video to publish it on the public Crowdfunding page.
          </p>
          {!schemaMissing && (
            <button
              type="button"
              onClick={openCreateModal}
              className="pill-primary text-xs h-9 px-4 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create first campaign</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const pct =
              item.targetAmount > 0
                ? Math.min(100, Math.round((item.raisedAmount / item.targetAmount) * 100))
                : 0;
            const badge = STATUS_BADGES[item.status] ?? STATUS_BADGES.active;

            return (
              <article
                key={item.id}
                className="bg-white rounded-modal border border-[#dce2ea] p-5 sm:p-6 shadow-2xs space-y-3.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                      <span className="font-bold text-ink">{item.personName}</span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-ink-steel">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      )}
                      {item.images.length > 0 && (
                        <span className="text-[11px] text-ink-steel">
                          · {item.images.length} photo{item.images.length === 1 ? "" : "s"}
                        </span>
                      )}
                      {item.video?.src && (
                        <span className="text-[11px] text-primary font-semibold">
                          · Video attached
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-ink leading-snug">
                      {item.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="h-8 px-3 rounded-full border border-[#dce2ea] bg-[#f9fafb] hover:bg-[#f1f4f8] text-xs font-semibold text-ink inline-flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5 text-primary" />
                      <span>Edit</span>
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-full p-0.5 pl-2.5">
                        <span className="text-[11px] font-semibold text-red-700">
                          Delete?
                        </span>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id)}
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
                        aria-label="Delete campaign"
                        className="w-8 h-8 rounded-full border border-[#dce2ea] bg-[#f9fafb] text-ink-steel hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-ink-slate leading-relaxed line-clamp-2">
                  {item.story}
                </p>

                {/* Funding Progress */}
                <div className="rounded-xl bg-[#f9fafb] border border-[#dce2ea] p-3.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span>
                      <strong className="text-ink font-bold">
                        {formatInr(item.raisedAmount)}
                      </strong>{" "}
                      <span className="text-ink-steel">
                        raised of {formatInr(item.targetAmount)} goal
                      </span>
                    </span>
                    <span className="font-mono font-bold text-primary">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#e5eaf1] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-primary transition-all duration-300"
                    />
                  </div>
                </div>

                {item.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.images.slice(0, 4).map((img, i) => (
                      <img
                        key={i}
                        src={img.src}
                        alt={img.alt || item.title}
                        className="w-16 h-12 object-cover rounded-lg border border-[#dce2ea]"
                      />
                    ))}
                    {item.images.length > 4 && (
                      <span className="w-16 h-12 rounded-lg border border-[#dce2ea] bg-[#f9fafb] text-xs font-bold text-ink-steel flex items-center justify-center">
                        +{item.images.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-modal border border-[#dce2ea] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce2ea] shrink-0">
              <h2 className="text-lg font-bold text-ink">
                {editingId ? "Edit crowdfunding campaign" : "Create crowdfunding campaign"}
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
                    Person&apos;s Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="e.g. Selvi Murugan"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Tambaram, Chennai"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Urgent Medical & Hospital Support"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Amount Needed (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Amount Raised (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={raisedAmount}
                    onChange={(e) => setRaisedAmount(e.target.value)}
                    placeholder="0"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "active" | "completed" | "paused")
                    }
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Funded / Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Details / Story <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Explain the situation, why support is needed, and how funds will be used..."
                  className="w-full p-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    UPI ID / Payment Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 5falls@upi"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 98400 XXXXX"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Optional Photos */}
              <div className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <ImagePlus className="w-4 h-4 text-primary" />
                    <span>Images (Optional)</span>
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#dce2ea] hover:border-primary/40 text-xs font-semibold text-primary cursor-pointer">
                    {uploadingMedia ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Upload images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files, "image")}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste image URL"
                    className="flex-1 h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 h-9 rounded-lg border border-[#dce2ea] bg-white hover:bg-[#f1f4f8] text-xs font-semibold text-ink"
                  >
                    Add URL
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="w-20 h-16 object-cover rounded-lg border border-[#dce2ea]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          aria-label="Remove photo"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Video */}
              <div className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-primary" />
                    <span>Video (Optional)</span>
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#dce2ea] hover:border-primary/40 text-xs font-semibold text-primary cursor-pointer">
                    {uploadingMedia ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Upload video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e.target.files, "video")}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={videoSrc}
                  onChange={(e) => setVideoSrc(e.target.value)}
                  placeholder="Or paste video URL"
                  className="w-full h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                />

                {videoSrc && (
                  <div className="relative rounded-xl overflow-hidden border border-[#dce2ea] bg-black">
                    <video src={videoSrc} controls className="w-full max-h-48" />
                    <button
                      type="button"
                      onClick={() => setVideoSrc("")}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold"
                    >
                      Remove video
                    </button>
                  </div>
                )}
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
                  disabled={submitting || uploadingMedia}
                  className="pill-primary text-sm h-10 px-5 gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingId ? "Save changes" : "Publish campaign"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
