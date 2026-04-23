import type { Role, User } from "@/generated/prisma/client"

export type Module = "projects" | "expenses" | "assets" | "contracts" | "approvals" | "settings"
export type PermissionAction = "canView" | "canCreate" | "canEdit" | "canDelete" | "canApprove"

type ModulePermissions = Record<PermissionAction, boolean>
type RoleMatrix = Record<Role, Record<Module, ModulePermissions>>

const FULL: ModulePermissions = { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true }
const VIEW_ONLY: ModulePermissions = { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false }
const MEMBER_DEFAULT: ModulePermissions = { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false }

export const ROLE_DEFAULTS: RoleMatrix = {
  ADMIN: {
    projects:  FULL,
    expenses:  FULL,
    assets:    FULL,
    contracts: FULL,
    approvals: FULL,
    settings:  FULL,
  },
  DIRECTOR: {
    projects:  { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
    expenses:  { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
    assets:    { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false },
    contracts: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
    approvals: { canView: true, canCreate: true, canEdit: false, canDelete: false, canApprove: true },
    settings:  VIEW_ONLY,
  },
  MEMBER: {
    projects:  VIEW_ONLY,
    expenses:  MEMBER_DEFAULT,
    assets:    VIEW_ONLY,
    contracts: VIEW_ONLY,
    approvals: VIEW_ONLY,
    settings:  VIEW_ONLY,
  },
  VIEWER: {
    projects:  VIEW_ONLY,
    expenses:  VIEW_ONLY,
    assets:    VIEW_ONLY,
    contracts: VIEW_ONLY,
    approvals: VIEW_ONLY,
    settings:  VIEW_ONLY,
  },
}

type UserWithPermissions = User & { permissions?: Array<{ module: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean; canApprove: boolean }> }

export function canAccess(user: UserWithPermissions, module: Module, action: PermissionAction): boolean {
  if (!user.isActive) return false

  // Check per-module permission override first
  const override = user.permissions?.find((p) => p.module === module)
  if (override) return override[action]

  // Fall back to role defaults
  return ROLE_DEFAULTS[user.role]?.[module]?.[action] ?? false
}
