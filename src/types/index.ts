export type ActionState<T = unknown> = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
  data?: T
}

export type { Role, ProjectStatus, ExpenseStatus, AssetType, AssetStatus, BillingCycle, ContractType, ContractStatus, ApprovalInstanceStatus, ApprovalStepStatus } from "@/generated/prisma"
