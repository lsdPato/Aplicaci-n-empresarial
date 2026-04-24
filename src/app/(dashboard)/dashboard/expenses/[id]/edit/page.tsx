import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { getExpense, listCategories, listTags } from "@/actions/expenses"
import { listProjects } from "@/actions/projects"
import { TransactionEditForm } from "@/components/expenses/transaction-edit-form"

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canEdit")) redirect("/dashboard/expenses")

  const [expense, projects, categories, tags] = await Promise.all([
    getExpense(id),
    listProjects(),
    listCategories(),
    listTags(),
  ])

  if (!expense) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar transacción</h1>
      <TransactionEditForm
        expense={expense}
        projects={projects}
        categories={categories}
        tags={tags}
      />
    </div>
  )
}
