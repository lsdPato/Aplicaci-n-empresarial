import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listExpenses, updateExpenseStatusAction, listTags } from "@/actions/expenses"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionFilters } from "@/components/expenses/transaction-filters"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Tag, ArrowUpCircle, ArrowDownCircle } from "lucide-react"

const statusBadge = {
  PENDING: <Badge variant="warning">Pendiente</Badge>,
  APPROVED: <Badge variant="success">Aprobado</Badge>,
  REJECTED: <Badge variant="destructive">Rechazado</Badge>,
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; tagId?: string }>
}) {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canView")) redirect("/dashboard")

  const { type, status, tagId } = await searchParams
  const [expenses, tags] = await Promise.all([
    listExpenses(undefined, status, type, tagId),
    listTags(),
  ])

  const canCreate = canAccess(user, "expenses", "canCreate")
  const canApprove = canAccess(user, "expenses", "canApprove")

  const totalIncome = expenses
    .filter((e) => e.type === "INCOME")
    .reduce((s, e) => s + Number(e.amount), 0)
  const totalExpenses = expenses
    .filter((e) => e.type === "EXPENSE")
    .reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transacciones</h1>
          <p className="text-muted-foreground">{expenses.length} registros</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/expenses/tags">
                  <Tag className="h-4 w-4" /> Etiquetas
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/expenses/categories">Categorías</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/expenses/new">
                  <Plus className="h-4 w-4" /> Nueva transacción
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(totalIncome.toString())}</p>
        </div>
        <div className="rounded-lg border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Egresos</p>
          <p className="mt-1 text-xl font-bold text-destructive">{formatCurrency(totalExpenses.toString())}</p>
        </div>
        <div className="rounded-lg border bg-card px-5 py-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className={`mt-1 text-xl font-bold ${totalIncome - totalExpenses >= 0 ? "text-green-600" : "text-destructive"}`}>
            {formatCurrency((totalIncome - totalExpenses).toString())}
          </p>
        </div>
      </div>

      <TransactionFilters tags={tags} />

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">No hay transacciones registradas</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Descripción</th>
                <th className="px-4 py-3 text-left font-medium">Proyecto</th>
                <th className="px-4 py-3 text-left font-medium">Categoría / Etiquetas</th>
                <th className="px-4 py-3 text-left font-medium">Monto</th>
                <th className="px-4 py-3 text-left font-medium">Fecha</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                {canApprove && <th className="px-4 py-3 text-left font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {e.type === "INCOME" ? (
                        <ArrowUpCircle className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 shrink-0 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium">{e.description}</p>
                        {e.notes && <p className="text-xs text-muted-foreground">{e.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{e.project.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {e.category && (
                        <span className="text-xs text-muted-foreground">{e.category.name}</span>
                      )}
                      {e.tags?.map((tag: { id: string; name: string; color: string }) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: tag.color + "22", color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {!e.category && (!e.tags || e.tags.length === 0) && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <span className={e.type === "INCOME" ? "text-green-600" : "text-destructive"}>
                      {e.type === "INCOME" ? "+" : "-"}{formatCurrency(e.amount.toString())}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(e.date)}</td>
                  <td className="px-4 py-3">{statusBadge[e.status as keyof typeof statusBadge]}</td>
                  {canApprove && (
                    <td className="px-4 py-3">
                      {e.status === "PENDING" && e.type === "EXPENSE" && (
                        <div className="flex gap-1">
                          <form action={async () => { "use server"; await updateExpenseStatusAction(e.id, "APPROVED") }}>
                            <Button type="submit" size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                              Aprobar
                            </Button>
                          </form>
                          <form action={async () => { "use server"; await updateExpenseStatusAction(e.id, "REJECTED") }}>
                            <Button type="submit" size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              Rechazar
                            </Button>
                          </form>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
