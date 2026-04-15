"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import type { ActionState } from "@/types"

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "DIRECTOR", "MEMBER", "VIEWER"]),
})

const updatePermissionsSchema = z.object({
  userId: z.string().min(1),
  module: z.string().min(1),
  canView: z.coerce.boolean().default(false),
  canCreate: z.coerce.boolean().default(false),
  canEdit: z.coerce.boolean().default(false),
  canDelete: z.coerce.boolean().default(false),
  canApprove: z.coerce.boolean().default(false),
})

export async function listUsers() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "settings", "canView")) return []

  return prisma.user.findMany({
    include: { permissions: true },
    orderBy: { createdAt: "asc" },
  })
}

export async function updateUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "settings", "canEdit")) {
    return { success: false, error: "Sin permisos" }
  }

  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  })
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  await prisma.user.update({ where: { id: parsed.data.userId }, data: { role: parsed.data.role } })
  revalidatePath("/settings/users")
  return { success: true }
}

export async function updateUserPermissions(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "settings", "canEdit")) {
    return { success: false, error: "Sin permisos" }
  }

  const parsed = updatePermissionsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const { userId, module, ...perms } = parsed.data
  await prisma.permission.upsert({
    where: { userId_module: { userId, module } },
    create: { userId, module, ...perms },
    update: perms,
  })
  revalidatePath("/settings/users")
  return { success: true }
}

export async function toggleUserActive(userId: string): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") return { success: false, error: "Sin permisos" }
  if (userId === user.id) return { success: false, error: "No puedes desactivarte a ti mismo" }

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { success: false, error: "Usuario no encontrado" }

  await prisma.user.update({ where: { id: userId }, data: { isActive: !target.isActive } })
  revalidatePath("/dashboard/settings/users")
  return { success: true }
}

// Simple form actions (no prev state) for server component forms
export async function updateUserRoleFormAction(formData: FormData): Promise<void> {
  "use server"
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "settings", "canEdit")) return

  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  })
  if (!parsed.success) return

  await prisma.user.update({ where: { id: parsed.data.userId }, data: { role: parsed.data.role } })
  revalidatePath("/dashboard/settings/users")
}
