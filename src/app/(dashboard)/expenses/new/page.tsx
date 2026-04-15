import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listCategories } from "@/actions/expenses"
import { listProjects } from "@/actions/projects"
import { ExpenseForm } from "@/components/expenses/expense-form"

export default async function NewExpensePage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canCreate")) redirect("/dashboard/expenses")

  const [projects, categories] = await Promise.all([listProjects(), listCategories()])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo gasto</h1>
      <ExpenseForm projects={projects} categories={categories} defaultProjectId={projectId} />
    </div>
  )
}
