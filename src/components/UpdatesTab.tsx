"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Pencil,
  Trash2,
  ImagePlus,
  Video,
  X,
  Loader2,
  Database,
  ExternalLink,
} from "lucide-react";
import {
  DEFAULT_UPDATE_CATEGORIES,
  getUpdateCategoryLabel,
  type UpdatePost,
} from "@/data/siteData";

interface UpdatesTabProps {
  onToast: (type: "success" | "info" | "error", text: string) => void;
}

export default function UpdatesTab({ onToast }: UpdatesTabProps) {
  const [updates, setUpdates] = useState<UpdatePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("work");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [images, setImages] = useState<{ src: string; alt: string; caption?: string }[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/updates");
      if (res.ok) {
        const data = (await res.json()) as {
          schemaMissing?: boolean;
          updates?: UpdatePost[];
        };
        setSchemaMissing(Boolean(data.schemaMissing));
        setUpdates(data.updates ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const availableCategories = useMemo(() => {
    const defaultIds = new Set(DEFAULT_UPDATE_CATEGORIES.map((c) => c.id));
    const extras = new Set<string>(customCategories);
    for (const u of updates) {
      if (u.category && !defaultIds.has(u.category)) {
        extras.add(u.category);
      }
    }
    return [
      ...DEFAULT_UPDATE_CATEGORIES,
      ...Array.from(extras).map((c) => ({ id: c, label: c })),
    ];
  }, [updates, customCategories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return updates.filter((u) => {
      if (categoryFilter !== "all" && u.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        u.title.toLowerCase().includes(q) ||
        u.description.toLowerCase().includes(q) ||
        u.displayDate.toLowerCase().includes(q)
      );
    });
  }, [updates, search, categoryFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setTitle("");
    setDescription("");
    setCategory("work");
    setAddingCategory(false);
    setNewCategoryName("");
    setImages([]);
    setImageUrlInput("");
    setVideoSrc("");
    setModalOpen(true);
  };

  const openEditModal = (item: UpdatePost) => {
    setEditingId(item.id);
    setDate(item.date);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setAddingCategory(false);
    setNewCategoryName("");
    setImages(item.images ?? []);
    setImageUrlInput("");
    setVideoSrc(item.video?.src ?? "");
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
        const res = await fetch("/api/updates/upload", {
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
            { src: data.url!, alt: title.trim() || data.name || "Field photo" },
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

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const existing = availableCategories.find(
      (c) =>
        c.id.toLowerCase() === trimmed.toLowerCase() ||
        c.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      setCategory(existing.id);
    } else {
      setCustomCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
      setCategory(trimmed);
    }
    setNewCategoryName("");
    setAddingCategory(false);
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImages((prev) => [
      ...prev,
      { src: url, alt: title.trim() || "Field update photo" },
    ]);
    setImageUrlInput("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !title.trim() || !description.trim()) {
      onToast("error", "Date, Title, and Description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        date,
        title: title.trim(),
        description: description.trim(),
        category,
        images,
        video: videoSrc.trim() ? { src: videoSrc.trim() } : null,
      };

      const isEdit = Boolean(editingId);
      const endpoint = isEdit ? `/api/updates/${editingId}` : "/api/updates";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string; update?: UpdatePost };
      if (!res.ok || !data.update) {
        onToast("error", data.error || "Could not save update.");
        return;
      }

      onToast(
        "success",
        isEdit ? "Field update updated." : "New field update published."
      );
      setModalOpen(false);
      await loadUpdates();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/updates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        onToast("error", data.error || "Failed to delete update.");
        return;
      }
      setUpdates((prev) => prev.filter((u) => u.id !== id));
      setConfirmDeleteId(null);
      onToast("info", "Field update deleted.");
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
            Public Website Content
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Field Updates
          </h1>
          <p className="text-sm text-ink-slate mt-1">
            Publish new updates with date, photos, or videos — or edit existing dispatches shown on{" "}
            <a href="/updates" target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5">
              /updates <ExternalLink className="w-3 h-3" />
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
          <span>New update</span>
        </button>
      </div>

      {schemaMissing && (
        <div className="rounded-modal border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Run `06_field_updates.sql` in Supabase SQL Editor</p>
            <p className="text-amber-800 mt-0.5">
              Currently showing static fallback dispatches. Run{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded">
                supabase/schemas/06_field_updates.sql
              </code>{" "}
              to enable creating, editing, and uploading photos/videos for field updates.
            </p>
          </div>
        </div>
      )}

      {/* Search & Category Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search updates by title, date, or description..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dce2ea] bg-white text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "work", label: "Work" },
            { id: "event", label: "Events" },
            { id: "news", label: "News" },
            { id: "celebration", label: "Celebrations" },
            ...availableCategories
              .filter((c) => !["work", "event", "news", "celebration"].includes(c.id))
              .map((c) => ({ id: c.id, label: c.label })),
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

      {/* Updates List */}
      {loading ? (
        <div className="bg-white rounded-modal border border-[#dce2ea] p-12 flex flex-col items-center justify-center gap-3 text-ink-steel">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading field updates...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-modal border border-[#dce2ea] p-10 text-center text-sm text-ink-slate">
          No field updates match your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-modal border border-[#dce2ea] p-5 sm:p-6 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-primary">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.displayDate}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f1f4f8] text-ink-slate font-semibold text-[11px]">
                      {getUpdateCategoryLabel(item.category)}
                    </span>
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

                {!schemaMissing && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="h-8 px-3 rounded-full border border-[#dce2ea] bg-[#f9fafb] hover:bg-[#f1f4f8] text-xs font-semibold text-ink inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-primary" />
                      <span>Edit</span>
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-full p-0.5 pl-2.5">
                        <span className="text-[11px] font-semibold text-red-700">Delete?</span>
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
                        aria-label="Delete update"
                        className="w-8 h-8 rounded-full border border-[#dce2ea] bg-[#f9fafb] text-ink-steel hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-sm text-ink-slate leading-relaxed line-clamp-3">
                {item.description}
              </p>

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
          ))}
        </div>
      )}

      {/* Create / Edit Update Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-modal border border-[#dce2ea] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce2ea] shrink-0">
              <h2 className="text-lg font-bold text-ink">
                {editingId ? "Edit field update" : "Create field update"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      Category
                    </label>
                    {!addingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingCategory(true);
                          setNewCategoryName("");
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add category</span>
                      </button>
                    )}
                  </div>

                  {addingCategory ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCategory();
                          } else if (e.key === "Escape") {
                            setAddingCategory(false);
                          }
                        }}
                        placeholder="New category name..."
                        autoFocus
                        className="flex-1 h-10 px-3 rounded-xl border border-primary bg-white text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                        className="h-10 px-3.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingCategory(false)}
                        aria-label="Cancel adding category"
                        className="h-10 w-10 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-ink-steel hover:bg-[#f1f4f8] flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === "__add_new__") {
                          setAddingCategory(true);
                          setNewCategoryName("");
                          return;
                        }
                        setCategory(e.target.value);
                      }}
                      className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {availableCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                      <option value="__add_new__">+ Add new category...</option>
                    </select>
                  )}
                </div>
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
                  placeholder="e.g. Desilting Phase 2 Completed at Puduthangal Lake"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the field work, milestones, or event details..."
                  className="w-full p-3.5 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-sm text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Optional Photos */}
              <div className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <ImagePlus className="w-4 h-4 text-primary" />
                    <span>Photos (Optional)</span>
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#dce2ea] hover:border-primary/40 text-xs font-semibold text-primary cursor-pointer">
                    {uploadingMedia ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Upload photos</span>
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
                    placeholder="Or paste photo URL (e.g. /img/lake-wide.webp)"
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
                      <div key={idx} className="relative group">
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
                  placeholder="Or paste video URL (e.g. /video/...mp4)"
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
                  <span>{editingId ? "Save changes" : "Publish update"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
