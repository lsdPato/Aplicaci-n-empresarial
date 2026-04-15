import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listExpenses, updateExpenseStatusAction } from "@/actions/expenses"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"

const statusBadge = {
  PENDING: <Badge variant="warning">Pendiente</Badge>,
  APPROVED: <Badge variant="success">Aprobado</Badge>,
  REJECTED: <Badge variant="destructive">Rechazado</Badge>,
}

export default async function ExpensesPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canView")) redirect("/dashboard")

  const expenses = await listExpenses()
  const canCreate = canAccess(user, "expenses", "canCreate")
  const canApprove = canAccess(user, "expenses", "canApprove")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">{expenses.length} registros</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <>
              <Button variant="outline" asChild>
                <Link href="/dashboard/expenses/categories">Categorías</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/expenses/new"><Plus className="h-4 w-4" /> Nuevo gasto</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">No hay gastos registrados</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Descripción</th>
                <th className="px-4 py-3 text-left font-medium">Proyecto</th>
                <th className="px-4 py-3 text-left font-medium">Categoría</th>
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
                    <p className="font-medium">{e.description}</p>
                    {e.notes && <p className="text-xs text-muted-foreground">{e.notes}</p>}
                  </td>
                  <td className="px-4 py-3">{e.project.name}</td>
                  <td className="px-4 py-3">{e.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(e.amount.toString())}</td>
                  <td className="px-4 py-3">{formatDate(e.date)}</td>
                  <td className="px-4 py-3">{statusBadge[e.status]}</td>
                  {canApprove && (
                    <td className="px-4 py-3">
                      {e.status === "PENDING" && (
                        <div className="flex gap-1">
                          <form action={async () => { "use server"; await updateExpenseStatusAction(e.id, "APPROVED") }}>
                            <Button type="submit" size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">Aprobar</Button>
                          </form>
                          <form action={async () => { "use server"; await updateExpenseStatusAction(e.id, "REJECTED") }}>
                            <Button type="submit" size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">Rechazar</Button>
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
