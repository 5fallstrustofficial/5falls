"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  Loader2,
  Save,
  Users,
  Key,
} from "lucide-react";
import {
  PERMISSION_AREAS,
  ACTION_LABELS,
  countGrantedPermissions,
  type PersonRecord,
  type RoleRecord,
  type RolePermissions,
  type PermissionAreaKey,
  type PermissionAction,
} from "@/types/portal";

interface AccessControlTabProps {
  people: PersonRecord[];
  roles: RoleRecord[];
  schemaNeedsUpdate: boolean;
  onRefresh: () => Promise<void>;
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

export default function AccessControlTab({
  people,
  roles,
  schemaNeedsUpdate,
  onRefresh,
  onToast,
}: AccessControlTabProps) {
  const [subTab, setSubTab] = useState<"members" | "roles">("members");
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>("admin");
  const [draftPermissions, setDraftPermissions] = useState<RolePermissions | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => roles.find((r) => r.slug === selectedRoleSlug) ?? roles[0] ?? null,
    [roles, selectedRoleSlug]
  );

  useEffect(() => {
    if (selectedRole) {
      setDraftPermissions(selectedRole.permissions);
    }
  }, [selectedRole]);

  const roleCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of people) {
      map[p.role] = (map[p.role] ?? 0) + 1;
    }
    return map;
  }, [people]);

  const handleAssignRole = async (userId: string, nextRole: string) => {
    setAssigningUserId(userId);
    try {
      const res = await fetch(`/api/people/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onToast("error", data.error || "Failed to update role.");
        return;
      }
      onToast("success", "Role assignment updated.");
      await onRefresh();
    } finally {
      setAssigningUserId(null);
    }
  };

  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setCreatingRole(true);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName.trim() }),
      });
      const data = (await res.json()) as { error?: string; role?: RoleRecord };
      if (!res.ok || !data.role) {
        onToast("error", data.error || "Could not create role.");
        return;
      }
      setNewRoleName("");
      setSelectedRoleSlug(data.role.slug);
      onToast("success", `Created role "${data.role.name}".`);
      await onRefresh();
    } finally {
      setCreatingRole(false);
    }
  };

  const handleTogglePermission = (
    area: PermissionAreaKey,
    action: PermissionAction
  ) => {
    if (!selectedRole || selectedRole.is_locked || !draftPermissions) return;
    setDraftPermissions((prev) => {
      if (!prev) return prev;
      const currentArea = prev[area] ?? {};
      return {
        ...prev,
        [area]: {
          ...currentArea,
          [action]: !currentArea[action],
        },
      };
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole || selectedRole.is_locked || !draftPermissions) return;
    if (selectedRole.id < 0) {
      onToast(
        "error",
        "Run the SQL files in supabase/schemas/ first so custom role permissions can be persisted."
      );
      return;
    }
    setSavingRole(true);
    try {
      const res = await fetch(`/api/roles/${selectedRole.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: draftPermissions }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onToast("error", data.error || "Could not save permissions.");
        return;
      }
      onToast("success", `Saved permissions for ${selectedRole.name}.`);
      await onRefresh();
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteCustomRole = async (role: RoleRecord) => {
    if (role.is_system || role.id < 0) return;
    setSavingRole(true);
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onToast("error", data.error || "Failed to delete role.");
        return;
      }
      setSelectedRoleSlug("admin");
      onToast("info", `Deleted role "${role.name}".`);
      await onRefresh();
    } finally {
      setSavingRole(false);
    }
  };

  const systemRoles = roles.filter((r) => r.is_system);
  const customRoles = roles.filter((r) => !r.is_system);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
          Permissions &amp; Roles
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Access control
        </h1>
        <p className="text-sm text-ink-slate mt-1">
          Roles define what Volunteers, Members, and coordinators can do. Build custom roles, then assign them to people.
        </p>
      </div>

      {schemaNeedsUpdate && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          Run the SQL files in <code className="font-mono bg-white px-1.5 py-0.5 rounded">supabase/schemas/</code> in Supabase SQL Editor to enable saving custom roles (`custom_roles` table).
        </div>
      )}

      {/* Sub-tabs: Volunteers & Members | Roles */}
      <div className="flex items-center gap-6 border-b border-[#dce2ea]">
        <button
          type="button"
          onClick={() => setSubTab("members")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === "members"
              ? "border-primary text-ink"
              : "border-transparent text-ink-steel hover:text-ink"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Volunteers &amp; Members</span>
          <span className="px-2 py-0.5 rounded-full bg-[#f1f4f8] text-xs text-ink-slate">
            {people.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("roles")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            subTab === "roles"
              ? "border-primary text-ink"
              : "border-transparent text-ink-steel hover:text-ink"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Roles</span>
          <span className="px-2 py-0.5 rounded-full bg-[#f1f4f8] text-xs text-ink-slate">
            {roles.length}
          </span>
        </button>
      </div>

      {/* Sub-tab 1: Volunteers & Members */}
      {subTab === "members" && (
        <div className="space-y-2.5">
          {people.map((person) => {
            const roleObj = roles.find((r) => r.slug === person.role);
            const permCount = roleObj ? countGrantedPermissions(roleObj.permissions) : 1;
            const isFullAccess = person.role === "admin";
            return (
              <div
                key={person.id}
                className="bg-white rounded-2xl border border-[#dce2ea] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(person.full_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-ink truncate">
                      {person.full_name}
                    </div>
                    <div className="text-xs text-ink-steel truncate">{person.email}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-xs text-ink-steel flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {isFullAccess
                        ? "Full access"
                        : `${permCount} permission${permCount === 1 ? "" : "s"} granted`}
                    </span>
                  </div>

                  {assigningUserId === person.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <select
                      value={person.role}
                      onChange={(e) => handleAssignRole(person.id, e.target.value)}
                      className="h-9 px-3 rounded-full border border-[#dce2ea] bg-[#f9fafb] text-xs font-semibold text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                    >
                      {roles.map((r) => (
                        <option key={r.slug} value={r.slug}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-tab 2: Roles & Permissions Matrix */}
      {subTab === "roles" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Roles List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-modal border border-[#dce2ea] p-4 space-y-2 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute px-2 pb-1">
                Built-in Roles
              </div>
              {systemRoles.map((r) => (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => setSelectedRoleSlug(r.slug)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedRole?.slug === r.slug
                      ? "bg-primary/10 text-primary border border-primary/25"
                      : "text-ink-slate hover:bg-[#f9fafb]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{r.name}</span>
                    {r.is_locked && <Lock className="w-3.5 h-3.5 opacity-70" />}
                  </span>
                  <span className="text-xs font-bold text-ink-steel">
                    {roleCounts[r.slug] ?? 0}
                  </span>
                </button>
              ))}

              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute px-2 pt-3 pb-1 border-t border-[#dce2ea]">
                Custom Roles
              </div>
              {customRoles.length === 0 ? (
                <div className="px-3 py-2 text-xs text-ink-mute">None yet.</div>
              ) : (
                customRoles.map((r) => (
                  <button
                    key={r.slug}
                    type="button"
                    onClick={() => setSelectedRoleSlug(r.slug)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedRole?.slug === r.slug
                        ? "bg-primary/10 text-primary border border-primary/25"
                        : "text-ink-slate hover:bg-[#f9fafb]"
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className="text-xs font-bold text-ink-steel">
                      {roleCounts[r.slug] ?? 0}
                    </span>
                  </button>
                ))
              )}

              {/* Create New Role Input */}
              <form onSubmit={handleCreateCustomRole} className="pt-3 border-t border-[#dce2ea] flex gap-2">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="New role, e.g. Coordinator"
                  className="flex-1 h-9 px-3 rounded-xl border border-[#dce2ea] bg-[#f9fafb] text-xs text-ink placeholder:text-ink-mute focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={creatingRole || !newRoleName.trim()}
                  aria-label="Create new role"
                  className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 shrink-0"
                >
                  {creatingRole ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Permissions Matrix */}
          {selectedRole && draftPermissions && (
            <div className="lg:col-span-8 bg-white rounded-modal border border-[#dce2ea] p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dce2ea]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-ink">{selectedRole.name}</h2>
                    {selectedRole.is_locked && (
                      <Lock className="w-4 h-4 text-ink-steel" />
                    )}
                  </div>
                  <p className="text-xs text-ink-slate mt-0.5">{selectedRole.description}</p>
                </div>

                {!selectedRole.is_locked && (
                  <div className="flex items-center gap-2">
                    {!selectedRole.is_system && (
                      <button
                        type="button"
                        disabled={savingRole}
                        onClick={() => handleDeleteCustomRole(selectedRole)}
                        className="h-9 px-3.5 rounded-full border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={savingRole}
                      onClick={handleSavePermissions}
                      className="pill-primary text-xs h-9 px-4 gap-1.5"
                    >
                      {savingRole ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save permissions</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Matrix Grid */}
              <div className="space-y-4">
                {PERMISSION_AREAS.map((area) => (
                  <div
                    key={area.key}
                    className="rounded-xl border border-[#dce2ea] bg-[#f9fafb] p-4"
                  >
                    <div className="text-xs font-bold text-ink mb-3">{area.label}</div>
                    <div className="flex flex-wrap gap-3">
                      {area.actions.map((action) => {
                        const checked = Boolean(draftPermissions[area.key]?.[action]);
                        return (
                          <label
                            key={action}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              checked
                                ? "bg-white border-primary/40 text-ink"
                                : "bg-white/60 border-[#dce2ea] text-ink-steel"
                            } ${
                              selectedRole.is_locked
                                ? "opacity-75 cursor-not-allowed"
                                : "cursor-pointer hover:border-primary/40"
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={selectedRole.is_locked}
                              checked={checked}
                              onChange={() => handleTogglePermission(area.key, action)}
                              className="w-3.5 h-3.5 accent-[#006aff] rounded"
                            />
                            <span>{ACTION_LABELS[action]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
