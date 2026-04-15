"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod/v4"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import type { ActionState } from "@/types"

// ─── Schemas ────────────────────────────────────────────────────────────────

const stepSchema = z.object({
  name: z.string().min(1, "Nombre del paso requerido"),
  approverId: z.string().min(1, "Aprobador requerido"),
  required: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).default(true),
})

const templateSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
})

// ─── Templates ──────────────────────────────────────────────────────────────

export async function createTemplateAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "approvals", "canCreate")) return { success: false, error: "Sin permisos" }

  const parsed = templateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  // Parse steps from FormData (stepName[], stepApprover[], stepRequired[])
  const stepNames = formData.getAll("stepName") as string[]
  const stepApprovers = formData.getAll("stepApprover") as string[]
  const stepRequired = formData.getAll("stepRequired") as string[]

  if (stepNames.length === 0) return { success: false, error: "El template debe tener al menos un paso" }

  const steps = stepNames.map((name, i) => ({
    name,
    approverId: stepApprovers[i],
    required: stepRequired[i] === "true",
    order: i + 1,
  }))

  for (const step of steps) {
    const sv = stepSchema.safeParse(step)
    if (!sv.success) return { success: false, error: `Paso ${step.order}: datos inválidos` }
  }

  const template = await prisma.approvalTemplate.create({
    data: {
      ...parsed.data,
      createdById: user.id,
      steps: { create: steps },
    },
  })

  revalidatePath("/dashboard/approvals")
  redirect(`/dashboard/approvals/templates/${template.id}`)
}

export async function updateTemplateAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "approvals", "canEdit")) return { success: false, error: "Sin permisos" }

  const id = formData.get("id") as string
  const parsed = templateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }

  const stepNames = formData.getAll("stepName") as string[]
  const stepApprovers = formData.getAll("stepApprover") as string[]
  const stepRequired = formData.getAll("stepRequired") as string[]

  if (stepNames.length === 0) return { success: false, error: "El template debe tener al menos un paso" }

  const steps = stepNames.map((name, i) => ({
    name,
    approverId: stepApprovers[i],
    required: stepRequired[i] === "true",
    order: i + 1,
  }))

  // Replace all steps (delete + recreate for simplicity)
  await prisma.$transaction([
    prisma.approvalTemplate.update({ where: { id }, data: parsed.data }),
    prisma.approvalTemplateStep.deleteMany({ where: { templateId: id } }),
    prisma.approvalTemplateStep.createMany({ data: steps.map((s) => ({ ...s, templateId: id })) }),
  ])

  revalidatePath("/dashboard/approvals")
  redirect(`/dashboard/approvals/templates/${id}`)
}

export async function deleteTemplateAction(id: string): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canDelete")) return { success: false, error: "Sin permisos" }

  await prisma.approvalTemplate.delete({ where: { id } })
  revalidatePath("/dashboard/approvals")
  return { success: true }
}

export async function listTemplates() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canView")) return []

  return prisma.approvalTemplate.findMany({
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { steps: true, instances: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTemplate(id: string) {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canView")) return null

  return prisma.approvalTemplate.findUnique({
    where: { id },
    include: {
      steps: {
        include: { approver: { select: { id: true, name: true, email: true } } },
        orderBy: { order: "asc" },
      },
      createdBy: { select: { name: true } },
    },
  })
}

// ─── Instances ───────────────────────────────────────────────────────────────

export async function createInstanceAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!canAccess(user, "approvals", "canCreate")) return { success: false, error: "Sin permisos" }

  const templateId = formData.get("templateId") as string
  const projectId = formData.get("projectId") as string

  if (!templateId || !projectId) return { success: false, error: "Template y proyecto requeridos" }

  const template = await prisma.approvalTemplate.findUnique({
    where: { id: templateId },
    include: { steps: { orderBy: { order: "asc" } } },
  })
  if (!template) return { success: false, error: "Template no encontrado" }
  if (template.steps.length === 0) return { success: false, error: "El template no tiene pasos" }

  const instance = await prisma.approvalInstance.create({
    data: {
      templateId,
      projectId,
      createdById: user.id,
      status: "IN_PROGRESS",
      currentStepOrder: 1,
      steps: {
        create: template.steps.map((s) => ({
          templateStepId: s.id,
          order: s.order,
          name: s.name,
          approverId: s.approverId,
          required: s.required,
          status: "PENDING",
        })),
      },
    },
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard/approvals")
  redirect(`/dashboard/approvals/instances/${instance.id}`)
}

export async function listInstances() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canView")) return []

  return prisma.approvalInstance.findMany({
    include: {
      template: { select: { name: true } },
      project: { select: { name: true } },
      createdBy: { select: { name: true } },
      steps: { include: { approver: { select: { name: true } } }, orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getInstance(id: string) {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canView")) return null

  return prisma.approvalInstance.findUnique({
    where: { id },
    include: {
      template: { select: { name: true, description: true } },
      project: { select: { id: true, name: true } },
      createdBy: { select: { name: true, email: true } },
      steps: {
        include: {
          approver: { select: { id: true, name: true, email: true } },
          templateStep: { select: { name: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  })
}

// ─── Decision (approve / reject) ─────────────────────────────────────────────

export async function submitDecisionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }

  const instanceStepId = formData.get("instanceStepId") as string
  const decision = formData.get("decision") as "APPROVED" | "REJECTED"
  const comment = (formData.get("comment") as string) || ""

  if (!["APPROVED", "REJECTED"].includes(decision)) {
    return { success: false, error: "Decisión inválida" }
  }

  const step = await prisma.approvalInstanceStep.findUnique({
    where: { id: instanceStepId },
    include: {
      instance: {
        include: {
          steps: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  if (!step) return { success: false, error: "Paso no encontrado" }
  if (step.approverId !== user.id) return { success: false, error: "No eres el aprobador de este paso" }
  if (step.status !== "PENDING") return { success: false, error: "Este paso ya fue decidido" }
  if (step.instance.currentStepOrder !== step.order) {
    return { success: false, error: "No es tu turno aún" }
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update the step
    await tx.approvalInstanceStep.update({
      where: { id: instanceStepId },
      data: { decision, comment, decidedAt: new Date(), status: decision === "APPROVED" ? "APPROVED" : "REJECTED" },
    })

    const instance = step.instance

    // 2. If required step rejected → BLOCKED
    if (decision === "REJECTED" && step.required) {
      await tx.approvalInstance.update({
        where: { id: instance.id },
        data: { status: "BLOCKED", completedAt: new Date() },
      })
      return
    }

    // 3. Find next PENDING step
    const nextStep = instance.steps.find((s) => s.order > step.order && s.status === "PENDING")

    if (nextStep) {
      await tx.approvalInstance.update({
        where: { id: instance.id },
        data: { currentStepOrder: nextStep.order },
      })
    } else {
      // All steps resolved → check if all required ones passed
      const allSteps = await tx.approvalInstanceStep.findMany({ where: { instanceId: instance.id } })
      const hasBlocker = allSteps.some((s) => s.required && s.status === "REJECTED")
      await tx.approvalInstance.update({
        where: { id: instance.id },
        data: { status: hasBlocker ? "BLOCKED" : "APPROVED", completedAt: new Date() },
      })
    }
  })

  revalidatePath(`/dashboard/approvals/instances/${step.instanceId}`)
  return { success: true }
}

export async function listMyPendingSteps() {
  const user = await getCurrentUser()
  if (!user) return []

  return prisma.approvalInstanceStep.findMany({
    where: {
      approverId: user.id,
      status: "PENDING",
      instance: { status: "IN_PROGRESS" },
    },
    include: {
      instance: {
        include: {
          template: { select: { name: true } },
          project: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })
}
