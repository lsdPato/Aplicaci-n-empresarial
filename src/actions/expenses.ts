"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod/v4"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { toPlain } from "@/lib/utils"
import { sendExpenseCreatedEmail, sendExpenseStatusEmail } from "@/lib/email"
import type { ActionState } from "@/types"

const expenseSchema = z.object({
  projectId: z.string().min(1, "Proyecto requerido"),
  categoryId: z.string().optional(),
  description: z.string().min(2, "Descripción requerida"),
  amount: z.preprocess((v) => Number(v), z.number().positive("Monto debe ser positivo")),
  date: z.preprocess((v) => new Date(v as string), z.date()),
  notes: z.string().optional(),
})

const categorySchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  color: z.string().optional(),
})

export async function createExpenseAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "expenses", "canCreate")) return { success: false, error: "Sin permisos" }

  const raw = Object.fromEntries(formData)
  const parsed = expenseSchema.safeParse({ ...raw, categoryId: raw.categoryId || undefined })
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const expense = await prisma.expense.create({
    data: { ...parsed.data, createdById: user.id },
    include: { project: { select: { name: true } } },
  })

  // Notify admins/directors that a new expense needs approval
  const approvers = await prisma.user.findMany({
    where: { isActive: true, role: { in: ["ADMIN", "DIRECTOR"] } },
    select: { email: true, name: true },
  })
  for (const approver of approvers) {
    sendExpenseCreatedEmail({
      to: approver.email,
      approverName: approver.name ?? approver.email,
      creatorName: user.name ?? user.email,
      projectName: expense.project.name,
      description: expense.description,
      amount: Number(expense.amount),
      expenseId: expense.id,
    }).catch(() => {})
  }

  revalidatePath("/dashboard/expenses")
  revalidatePath(`/dashboard/projects/${parsed.data.projectId}`)
  redirect("/dashboard/expenses")
}

export async function updateExpenseStatusAction(
  expenseId: string,
  status: "APPROVED" | "REJECTED"
): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "expenses", "canApprove")) return { success: false, error: "Sin permisos" }

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      project: { select: { name: true } },
      createdBy: { select: { email: true, name: true } },
    },
  })
  if (!expense) return { success: false, error: "Gasto no encontrado" }

  await prisma.expense.update({
    where: { id: expenseId },
    data: { status, approvedById: user.id, approvedAt: new Date() },
  })

  // Notify the expense creator of the decision
  sendExpenseStatusEmail({
    to: expense.createdBy.email,
    creatorName: expense.createdBy.name ?? expense.createdBy.email,
    approverName: user.name ?? user.email,
    projectName: expense.project.name,
    description: expense.description,
    amount: Number(expense.amount),
    status,
  }).catch(() => {})

  revalidatePath("/dashboard/expenses")
  revalidatePath(`/dashboard/projects/${expense.projectId}`)
  return { success: true }
}

export async function deleteExpenseAction(id: string): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "expenses", "canDelete")) return { success: false, error: "Sin permisos" }

  const expense = await prisma.expense.findUnique({ where: { id } })
  if (!expense) return { success: false, error: "No encontrado" }

  await prisma.expense.delete({ where: { id } })
  revalidatePath("/dashboard/expenses")
  revalidatePath(`/dashboard/projects/${expense.projectId}`)
  return { success: true }
}

export async function listExpenses(projectId?: string, status?: string) {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canView")) return []

  const data = await prisma.expense.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(status && status !== "ALL" ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {}),
    },
    include: {
      project: { select: { name: true } },
      category: true,
      createdBy: { select: { name: true, email: true } },
      approvedBy: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  })
  return toPlain(data)
}

export async function listCategories() {
  return prisma.expenseCategory.findMany({ orderBy: { name: "asc" } })
}

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canCreate")) return { success: false, error: "Sin permisos" }

  const parsed = categorySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  await prisma.expenseCategory.create({ data: parsed.data })
  revalidatePath("/dashboard/expenses/categories")
  return { success: true }
}

// Simple form action (no prev state) for server component forms
export async function createCategoryFormAction(formData: FormData): Promise<void> {
  "use server"
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canCreate")) return

  const parsed = categorySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return

  await prisma.expenseCategory.create({ data: parsed.data })
  revalidatePath("/dashboard/expenses/categories")
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canDelete")) return { success: false, error: "Sin permisos" }

  await prisma.expenseCategory.delete({ where: { id } })
  revalidatePath("/dashboard/expenses/categories")
  return { success: true }
}
