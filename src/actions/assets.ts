"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod/v4"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { toPlain } from "@/lib/utils"
import type { ActionState } from "@/types"

const assetSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  type: z.enum(["DOMAIN", "HOSTING", "LICENSE"]),
  provider: z.string().min(1, "Proveedor requerido"),
  cost: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().positive().optional()),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL", "ONE_TIME"]).optional(),
  expirationDate: z.preprocess((v) => (v === "" ? undefined : new Date(v as string)), z.date().optional()),
  alertDays: z.preprocess((v) => (v === "" ? 30 : Number(v)), z.number().min(1).max(365).default(30)),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).default("ACTIVE"),
  url: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
})

export async function createAssetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "assets", "canCreate")) return { success: false, error: "Sin permisos" }

  const raw = Object.fromEntries(formData)
  const parsed = assetSchema.safeParse({
    ...raw,
    billingCycle: raw.billingCycle || undefined,
    url: raw.url || undefined,
  })
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  await prisma.digitalAsset.create({ data: parsed.data })
  revalidatePath("/dashboard/assets")
  redirect("/dashboard/assets")
}

export async function updateAssetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "assets", "canEdit")) return { success: false, error: "Sin permisos" }

  const id = formData.get("id") as string
  const raw = Object.fromEntries(formData)
  const parsed = assetSchema.safeParse({
    ...raw,
    billingCycle: raw.billingCycle || undefined,
    url: raw.url || undefined,
  })
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  await prisma.digitalAsset.update({ where: { id }, data: parsed.data })
  revalidatePath("/dashboard/assets")
  redirect("/dashboard/assets")
}

export async function deleteAssetAction(id: string): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "assets", "canDelete")) return { success: false, error: "Sin permisos" }

  await prisma.digitalAsset.delete({ where: { id } })
  revalidatePath("/dashboard/assets")
  return { success: true }
}

export async function listAssets() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "assets", "canView")) return []

  const data = await prisma.digitalAsset.findMany({ orderBy: [{ expirationDate: "asc" }, { name: "asc" }] })
  return toPlain(data)
}
