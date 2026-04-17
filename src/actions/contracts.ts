"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod/v4"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { createAdminClient } from "@/lib/supabase/admin"
import { toPlain } from "@/lib/utils"
import type { ActionState } from "@/types"

const contractSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  counterparty: z.string().min(1, "Contraparte requerida"),
  type: z.enum(["SERVICE", "NDA", "EMPLOYMENT", "PARTNERSHIP", "OTHER"]),
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"]).default("DRAFT"),
  signedDate: z.preprocess((v) => (v === "" ? undefined : new Date(v as string)), z.date().optional()),
  expirationDate: z.preprocess((v) => (v === "" ? undefined : new Date(v as string)), z.date().optional()),
  value: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().positive().optional()),
  notes: z.string().optional(),
})

export async function createContractAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "contracts", "canCreate")) return { success: false, error: "Sin permisos" }

  const parsed = contractSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  // Handle file upload if provided
  const file = formData.get("file") as File | null
  let fileUrl: string | undefined
  let filePath: string | undefined

  if (file && file.size > 0) {
    const uploadResult = await uploadContractFile(file)
    if (!uploadResult.success) return { success: false, error: uploadResult.error }
    fileUrl = uploadResult.fileUrl
    filePath = uploadResult.filePath
  }

  await prisma.contract.create({
    data: { ...parsed.data, createdById: user.id, fileUrl, filePath },
  })

  revalidatePath("/dashboard/contracts")
  redirect("/dashboard/contracts")
}

export async function updateContractAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "contracts", "canEdit")) return { success: false, error: "Sin permisos" }

  const id = formData.get("id") as string
  const parsed = contractSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const file = formData.get("file") as File | null
  let fileUrl: string | undefined
  let filePath: string | undefined

  if (file && file.size > 0) {
    const uploadResult = await uploadContractFile(file)
    if (!uploadResult.success) return { success: false, error: uploadResult.error }
    fileUrl = uploadResult.fileUrl
    filePath = uploadResult.filePath
  }

  await prisma.contract.update({
    where: { id },
    data: { ...parsed.data, ...(fileUrl ? { fileUrl, filePath } : {}) },
  })

  revalidatePath("/dashboard/contracts")
  redirect("/dashboard/contracts")
}

async function uploadContractFile(file: File): Promise<{ success: true; fileUrl: string; filePath: string } | { success: false; error: string }> {
  const supabase = createAdminClient()
  const ext = file.name.split(".").pop()
  const path = `contracts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from("legal-documents")
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) return { success: false, error: `Error al subir archivo: ${error.message}` }

  const { data: { publicUrl } } = supabase.storage.from("legal-documents").getPublicUrl(path)
  return { success: true, fileUrl: publicUrl, filePath: path }
}

export async function deleteContractAction(id: string): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "contracts", "canDelete")) return { success: false, error: "Sin permisos" }

  const contract = await prisma.contract.findUnique({ where: { id } })
  if (!contract) return { success: false, error: "No encontrado" }

  // Delete file from storage if exists
  if (contract.filePath) {
    const supabase = createAdminClient()
    await supabase.storage.from("legal-documents").remove([contract.filePath])
  }

  await prisma.contract.delete({ where: { id } })
  revalidatePath("/dashboard/contracts")
  return { success: true }
}

export async function listContracts() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "contracts", "canView")) return []

  const data = await prisma.contract.findMany({
    include: { createdBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
  return toPlain(data)
}
