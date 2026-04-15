import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { getProject, deleteProjectAction } from "@/actions/projects"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Pencil, Trash2, Receipt, GitMerge } from "lucide-react"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "projects", "canView")) redirect("/dashboard")

  const project = await getProject(id)
  if (!project) notFound()

  const canEdit = canAccess(user, "projects", "canEdit")
  const canDelete = canAccess(user, "projects", "canDelete")

  const totalExpenses = project.expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const pendingExpenses = project.expenses.filter((e) => e.status === "PENDING").length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && <p className="text-muted-foreground">{project.description}</p>}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/projects/${id}/edit`}><Pencil className="h-4 w-4" /> Editar</Link>
            </Button>
          )}
          {canDelete && (
            <form action={async () => { "use server"; await deleteProjectAction(id); redirect("/dashboard/projects") }}>
              <Button type="submit" variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" /> Eliminar
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Presupuesto</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(project.budget?.toString())}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total gastos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Período</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{formatDate(project.startDate)} – {formatDate(project.endDate)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Receipt className="h-4 w-4" /> Gastos</CardTitle>
          <div className="flex items-center gap-2">
            {pendingExpenses > 0 && <Badge variant="warning">{pendingExpenses} pendientes</Badge>}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/expenses/new?projectId=${id}`}>Añadir gasto</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay gastos registrados</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Descripción</th>
                  <th className="px-3 py-2 text-left">Categoría</th>
                  <th className="px-3 py-2 text-left">Monto</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {project.expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2">{e.description}</td>
                    <td className="px-3 py-2">{e.category?.name ?? "—"}</td>
                    <td className="px-3 py-2 font-medium">{formatCurrency(e.amount.toString())}</td>
                    <td className="px-3 py-2">{formatDate(e.date)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={e.status === "APPROVED" ? "success" : e.status === "REJECTED" ? "destructive" : "warning"}>
                        {e.status === "APPROVED" ? "Aprobado" : e.status === "REJECTED" ? "Rechazado" : "Pendiente"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {project.approvalInstances.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><GitMerge className="h-4 w-4" /> Flujos de aprobación</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {project.approvalInstances.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="font-medium">{inst.template.name}</p>
                  <p className="text-xs text-muted-foreground">Iniciado por {inst.createdBy.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    inst.status === "APPROVED" ? "success" :
                    inst.status === "BLOCKED" || inst.status === "REJECTED" ? "destructive" :
                    "warning"
                  }>{inst.status}</Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/approvals/instances/${inst.id}`}>Ver</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
