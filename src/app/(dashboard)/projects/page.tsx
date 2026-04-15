import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listProjects } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, FolderOpen } from "lucide-react"

export default async function ProjectsPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "projects", "canView")) redirect("/dashboard")

  const projects = await listProjects()
  const canCreate = canAccess(user, "projects", "canCreate")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">{projects.length} proyectos en total</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="h-4 w-4" /> Nuevo proyecto
            </Link>
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay proyectos aún</p>
          {canCreate && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/projects/new">Crear primer proyecto</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Presupuesto</th>
                <th className="px-4 py-3 text-left font-medium">Inicio</th>
                <th className="px-4 py-3 text-left font-medium">Gastos</th>
                <th className="px-4 py-3 text-left font-medium">Creado por</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/projects/${p.id}`} className="font-medium text-primary hover:underline">
                      {p.name}
                    </Link>
                    {p.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{p.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3"><ProjectStatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">{formatCurrency(p.budget?.toString())}</td>
                  <td className="px-4 py-3">{formatDate(p.startDate)}</td>
                  <td className="px-4 py-3">{p._count.expenses}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.createdBy.name ?? p.createdBy.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
