"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod/v4"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { toPlain } from "@/lib/utils"
import type { ActionState } from "@/types"

const projectSchema = z.object({
  name: z.string().min(2, "Nombre requerido (mín. 2 caracteres)").max(200),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "CLOSED"]).default("ACTIVE"),
  budget: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().positive().optional()),
  startDate: z.preprocess((v) => (v === "" ? undefined : new Date(v as string)), z.date().optional()),
  endDate: z.preprocess((v) => (v === "" ? undefined : new Date(v as string)), z.date().optional()),
})

export async function createProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "projects", "canCreate")) return { success: false, error: "Sin permisos" }

  const parsed = projectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const project = await prisma.project.create({
    data: { ...parsed.data, createdById: user.id },
  })

  revalidatePath("/dashboard/projects")
  redirect(`/dashboard/projects/${project.id}`)
}

export async function updateProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "projects", "canEdit")) return { success: false, error: "Sin permisos" }

  const id = formData.get("id") as string
  const parsed = projectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  await prisma.project.update({ where: { id }, data: parsed.data })
  revalidatePath(`/dashboard/projects/${id}`)
  revalidatePath("/dashboard/projects")
  redirect(`/dashboard/projects/${id}`)
}

export async function deleteProjectAction(id: string): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "projects", "canDelete")) return { success: false, error: "Sin permisos" }

  await prisma.project.delete({ where: { id } })
  revalidatePath("/dashboard/projects")
  return { success: true }
}

export async function listProjects(status?: string) {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "projects", "canView")) return []

  const data = await prisma.project.findMany({
    where: status && status !== "ALL" ? { status: status as "ACTIVE" | "PAUSED" | "CLOSED" } : undefined,
    include: {
      createdBy: { select: { name: true, email: true } },
      _count: { select: { expenses: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return toPlain(data)
}

export async function getProject(id: string) {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "projects", "canView")) return null

  const data = await prisma.project.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      expenses: {
        include: { category: true, createdBy: { select: { name: true } } },
        orderBy: { date: "desc" },
      },
      approvalInstances: {
        include: { template: true, createdBy: { select: { name: true } } },
      },
    },
  })
  return toPlain(data)
}
