"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Video,
  Play,
  X,
  Loader2,
  Database,
  HardDrive,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { GalleryItem } from "@/data/galleryData";
import type { StaticMediaStats } from "@/data/staticMediaStats";

interface GalleryTabProps {
  onToast: (type: "success" | "info" | "error", text: string) => void;
}

interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  remainingBytes: number;
  percentUsed: number;
  fileCount: number;
  buckets: { name: string; bytes: number; files: number }[];
  staticMedia?: StaticMediaStats;
  totalMediaBytes?: number;
  totalMediaFiles?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

const CATEGORY_LABELS: Record<GalleryItem["category"], string> = {
  videos: "Reels & Videos",
  lake: "Lake & Water",
  events: "Events & Ministers",
  work: "Field Operations",
};

export default function GalleryTab({ onToast }: GalleryTabProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Storage Quota state
  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [storageLoading, setStorageLoading] = useState(true);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [category, setCategory] = useState<GalleryItem["category"]>("lake");
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [poster, setPoster] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = (await res.json()) as {
          schemaMissing?: boolean;
          items?: GalleryItem[];
        };
        setSchemaMissing(Boolean(data.schemaMissing));
        setItems(data.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStorage = async () => {
    setStorageLoading(true);
    try {
      const res = await fetch("/api/storage/usage");
      if (res.ok) {
        const data = (await res.json()) as StorageUsage;
        setStorage(data);
      }
    } finally {
      setStorageLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
    loadStorage();
  }, []);

  const counts = useMemo(() => {
    return {
      all: items.length,
      videos: items.filter((i) => i.category === "videos").length,
      lake: items.filter((i) => i.category === "lake").length,
      events: items.filter((i) => i.category === "events").length,
      work: items.filter((i) => i.category === "work").length,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
      if (!q) return true;
      return i.title.toLowerCase().includes(q);
    });
  }, [items, search, categoryFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setMediaType("image");
    setCategory("lake");
    setTitle("");
    setSrc("");
    setPoster("");
    setModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingId(item.id);
    setMediaType(item.type);
    setCategory(item.category);
    setTitle(item.title);
    setSrc(item.src);
    setPoster(item.poster ?? "");
    setModalOpen(true);
  };

  const handleUploadFile = async (
    file: File | undefined,
    target: "main" | "poster"
  ) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/gallery/upload", {
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
        onToast("error", data.error || "Upload failed.");
        return;
      }

      if (target === "poster") {
        setPoster(data.url);
      } else {
        setSrc(data.url);
        if (data.mediaType) {
          setMediaType(data.mediaType);
          if (data.mediaType === "video") setCategory("videos");
        }
        if (!title.trim() && data.name) {
          setTitle(data.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "));
        }
      }
      onToast("success", "Uploaded to Supabase Storage.");
      await loadStorage();
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !src.trim()) {
      onToast("error", "Title and media file/URL are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: mediaType,
        category,
        title: title.trim(),
        src: src.trim(),
        poster: poster.trim() || undefined,
      };

      const isEdit = Boolean(editingId);
      const endpoint = isEdit ? `/api/gallery/${editingId}` : "/api/gallery";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string; item?: GalleryItem };
      if (!res.ok || !data.item) {
        onToast("error", data.error || "Failed to save gallery item.");
        return;
      }

      onToast(
        "success",
        isEdit ? "Gallery item updated." : "Added to public gallery."
      );
      setModalOpen(false);
      await Promise.all([loadGallery(), loadStorage()]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        onToast("error", data.error || "Failed to delete item.");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setConfirmDeleteId(null);
      onToast("info", "Gallery item removed.");
      await loadStorage();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Storage Capacity Meters: Supabase + GitHub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Supabase Storage */}
        <div className="bg-white rounded-modal border border-[#dce2ea] p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-primary flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-ink">
                  Supabase Storage
                </div>
                <div className="text-[11px] text-ink-steel">
                  {storageLoading
                    ? "Calculating bucket usage..."
                    : storage
                    ? `${formatBytes(storage.usedBytes)} occupied of ${formatBytes(
                        storage.quotaBytes
                      )} · ${storage.fileCount} file${
                        storage.fileCount === 1 ? "" : "s"
                      }`
                    : "Storage stats unavailable"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {storage && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  {formatBytes(storage.remainingBytes)} free
                </span>
              )}
              <button
                type="button"
                onClick={loadStorage}
                disabled={storageLoading}
                aria-label="Refresh storage stats"
                className="w-8 h-8 rounded-full border border-[#dce2ea] bg-[#f9fafb] hover:bg-[#f1f4f8] flex items-center justify-center text-ink-slate"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${storageLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {storage && (
            <>
              <div className="w-full h-2.5 rounded-full bg-[#f1f4f8] overflow-hidden">
                <div
                  style={{
                    width: `${Math.max(
                      storage.percentUsed,
                      storage.usedBytes > 0 ? 1.5 : 0
                    )}%`,
                  }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    storage.percentUsed > 90
                      ? "bg-red-500"
                      : storage.percentUsed > 75
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                />
              </div>

              {storage.buckets.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-steel">
                  {storage.buckets.map((b) => (
                    <span key={b.name} className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="font-mono text-ink">{b.name}</span>:{" "}
                      <span>
                        {formatBytes(b.bytes)} ({b.files})
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* GitHub / Bundled Repo Storage */}
        {(() => {
          const ghQuotaBytes = 1024 * 1024 * 1024; // 1.00 GB recommended GitHub repo size
          const ghUsedBytes = storage?.staticMedia?.totalBytes ?? 0;
          const ghFiles = storage?.staticMedia?.totalFiles ?? 0;
          const ghFreeBytes = Math.max(0, ghQuotaBytes - ghUsedBytes);
          const ghPercent = Math.min(
            100,
            Number(((ghUsedBytes / ghQuotaBytes) * 100).toFixed(2))
          );

          return (
            <div className="bg-white rounded-modal border border-[#dce2ea] p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-[#dce2ea] text-ink flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">
                      GitHub Repo Storage (<code className="font-mono">public/</code>)
                    </div>
                    <div className="text-[11px] text-ink-steel">
                      {storageLoading
                        ? "Checking repo media..."
                        : `${formatBytes(ghUsedBytes)} occupied of ${formatBytes(
                            ghQuotaBytes
                          )} · ${ghFiles} files`}
                    </div>
                  </div>
                </div>

                {storage && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-center">
                    {formatBytes(ghFreeBytes)} free
                  </span>
                )}
              </div>

              {storage && (
                <>
                  <div className="w-full h-2.5 rounded-full bg-[#f1f4f8] overflow-hidden">
                    <div
                      style={{
                        width: `${Math.max(ghPercent, ghUsedBytes > 0 ? 1.5 : 0)}%`,
                      }}
                      className="h-full rounded-full bg-slate-700 transition-all duration-500"
                    />
                  </div>

                  {storage.staticMedia && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-steel">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        <span className="font-mono text-ink">bundled-images</span>:{" "}
                        <span>
                          {formatBytes(storage.staticMedia.imageBytes)} (
                          {storage.staticMedia.imageFiles})
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <span className="font-mono text-ink">bundled-videos</span>:{" "}
                        <span>
                          {formatBytes(storage.staticMedia.videoBytes)} (
                          {storage.staticMedia.videoFiles})
                        </span>
                      </span>
                      <span className="text-ink-mute">
                        · max 25 MB/file on Cloudflare
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
            Public Website Media
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Gallery
          </h1>
          <p className="text-sm text-ink-slate mt-1">
            Add, edit, or delete photos and video reels displayed live on{" "}
            <a
              href="/gallery"
              target="_blank"
              rel="noreferrer"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              /gallery <ExternalLink className="w-3 h-3" />
            </a>.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={schemaMissing}
          className="pill-primary text-sm h-10 px-5 gap-1.5 shadow-sm shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add media</span>
        </button>
      </div>

      {schemaMissing && (
        <div className="rounded-modal border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Run `07_gallery.sql` in Supabase SQL Editor</p>
            <p className="text-amber-800 mt-0.5">
              Currently showing static fallback items. Run{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded">
                supabase/schemas/07_gallery.sql
              </code>{" "}
              to enable adding, editing, and deleting gallery items.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gallery by title..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-white text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: `All (${counts.all})` },
            { id: "videos", label: `Videos (${counts.videos})` },
            { id: "lake", label: `Lake & Water (${counts.lake})` },
            { id: "events", label: `Events (${counts.events})` },
            { id: "work", label: `Field Ops (${counts.work})` },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                categoryFilter === c.id
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-ink-slate border-[#dce2ea] hover:bg-[#f1f4f8]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-modal border border-[#dce2ea] p-12 flex flex-col items-center justify-center gap-3 text-ink-steel">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading gallery items...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-modal border border-[#dce2ea] p-10 text-center text-sm text-ink-slate">
          No gallery items match your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-modal border border-[#dce2ea] overflow-hidden shadow-2xs flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-slate-900">
                {item.type === "video" && !item.poster ? (
                  <video
                    src={item.src}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={item.poster || item.src}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold text-ink border border-white/40">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                </div>

                {item.type === "video" && (
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow">
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <h3 className="text-sm font-bold text-ink line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                {!schemaMissing && (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#dce2ea]">
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
                          className="px-2 py-1 rounded-full text-[11px] font-semibold text-ink-slate"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        aria-label="Delete item"
                        className="w-8 h-8 rounded-full border border-[#dce2ea] bg-[#f9fafb] text-ink-steel hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Gallery Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-modal border border-[#dce2ea] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce2ea] shrink-0">
              <h2 className="text-lg font-bold text-ink">
                {editingId ? "Edit gallery item" : "Add to gallery"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-steel hover:bg-[#f1f4f8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} data-lenis-prevent className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#f1f4f8]">
                <button
                  type="button"
                  onClick={() => setMediaType("image")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mediaType === "image"
                      ? "bg-white text-ink shadow-2xs"
                      : "text-ink-slate"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaType("video");
                    setCategory("videos");
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mediaType === "video"
                      ? "bg-white text-ink shadow-2xs"
                      : "text-ink-slate"
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-primary" />
                  <span>Video Reel</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lake bund tree plantation drive"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GalleryItem["category"])}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="lake">Lake &amp; Water</option>
                  <option value="events">Events &amp; Ministers</option>
                  <option value="work">Field Operations</option>
                  <option value="videos">Reels &amp; Videos</option>
                </select>
              </div>

              {/* Upload or URL */}
              <div className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">
                    {mediaType === "video" ? "Video File / URL *" : "Photo File / URL *"}
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#dce2ea] hover:border-primary/40 text-xs font-semibold text-primary cursor-pointer">
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{mediaType === "video" ? "Upload video" : "Upload photo"}</span>
                    <input
                      type="file"
                      accept={mediaType === "video" ? "video/*" : "image/*"}
                      onChange={(e) => handleUploadFile(e.target.files?.[0], "main")}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  required
                  value={src}
                  onChange={(e) => setSrc(e.target.value)}
                  placeholder="Or paste URL (e.g. /img/...)"
                  className="w-full h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                />

                {src && mediaType === "image" && (
                  <img
                    src={src}
                    alt={title || "Preview"}
                    className="w-full max-h-40 object-cover rounded-lg border border-[#dce2ea]"
                  />
                )}
                {src && mediaType === "video" && (
                  <video
                    src={src}
                    controls
                    className="w-full max-h-40 rounded-lg border border-[#dce2ea] bg-black"
                  />
                )}
              </div>

              {/* Optional Poster for Videos */}
              {mediaType === "video" && (
                <div className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">
                      Video Thumbnail / Poster (Optional)
                    </span>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#dce2ea] text-xs font-semibold text-primary cursor-pointer">
                      <Plus className="w-3 h-3" />
                      <span>Upload poster</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadFile(e.target.files?.[0], "poster")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={poster}
                    onChange={(e) => setPoster(e.target.value)}
                    placeholder="Optional thumbnail URL"
                    className="w-full h-9 px-3 rounded-lg border border-[#dce2ea] bg-white text-xs text-ink"
                  />
                </div>
              )}

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
                  <span>{editingId ? "Save changes" : "Add to gallery"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
