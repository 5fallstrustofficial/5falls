export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "publish"
  | "verify"
  | "bulk_upload"
  | "send_email";

export type PermissionAreaKey =
  | "announcements"
  | "people"
  | "access_control"
  | "verification";

export type RolePermissions = Record<PermissionAreaKey, Partial<Record<PermissionAction, boolean>>>;

export interface RoleRecord {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_system: boolean;
  is_locked: boolean;
  permissions: RolePermissions;
  member_count?: number;
}

export interface PersonRecord {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  district: string | null;
  payment_completed: boolean;
  payment_reference: string | null;
  role: string;
  is_verified: boolean;
  email_confirmed: boolean;
  last_sign_in_at: string | null;
  created_at: string;
}

export const PERMISSION_AREAS: {
  key: PermissionAreaKey;
  label: string;
  actions: PermissionAction[];
}[] = [
  {
    key: "announcements",
    label: "Announcements",
    actions: ["view", "create", "edit", "delete", "publish", "send_email"],
  },
  {
    key: "people",
    label: "People & Members",
    actions: ["view", "create", "edit", "delete", "bulk_upload"],
  },
  {
    key: "verification",
    label: "Verification & Payments",
    actions: ["view", "verify", "edit"],
  },
  {
    key: "access_control",
    label: "Access control",
    actions: ["view", "create", "edit", "delete"],
  },
];

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  publish: "Publish / Pin",
  verify: "Verify",
  bulk_upload: "Bulk upload",
  send_email: "Send email",
};

export const DEFAULT_SYSTEM_ROLES: RoleRecord[] = [
  {
    id: -1,
    name: "Admin",
    slug: "admin",
    description: "Full access to everything. Locked.",
    is_system: true,
    is_locked: true,
    permissions: {
      announcements: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        publish: true,
        send_email: true,
      },
      people: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        bulk_upload: true,
      },
      verification: { view: true, verify: true, edit: true },
      access_control: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: -2,
    name: "Member",
    slug: "member",
    description: "Paid Trust member. Can view announcements and participate in discussions.",
    is_system: true,
    is_locked: false,
    permissions: {
      announcements: { view: true },
      people: {},
      verification: {},
      access_control: {},
    },
  },
  {
    id: -3,
    name: "Volunteer",
    slug: "volunteer",
    description: "Registered volunteer (payment pending). Can view announcements and comment.",
    is_system: true,
    is_locked: false,
    permissions: {
      announcements: { view: true },
      people: {},
      verification: {},
      access_control: {},
    },
  },
];

export function countGrantedPermissions(permissions: RolePermissions): number {
  let count = 0;
  for (const area of Object.values(permissions)) {
    if (!area) continue;
    for (const val of Object.values(area)) {
      if (val) count += 1;
    }
  }
  return count;
}
