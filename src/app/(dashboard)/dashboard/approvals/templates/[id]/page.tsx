import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { getTemplate, deleteTemplateAction } from "@/actions/approvals"
import { listUsers } from "@/actions/users"
import { listProjects } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StartFlowDialog } from "@/components/approvals/start-flow-dialog"
import { listTemplates } from "@/actions/approvals"
import { Pencil, Trash2 } from "lucide-react"

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canView")) redirect("/dashboard/approvals")

  const [template, users, projects, allTemplates] = await Promise.all([
    getTemplate(id),
    listUsers(),
    listProjects(),
    listTemplates(),
  ])
  if (!template) notFound()

  const canEdit = canAccess(user, "approvals", "canEdit")
  const canDelete = canAccess(user, "approvals", "canDelete")
  const canCreate = canAccess(user, "approvals", "canCreate")

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{template.name}</h1>
          {template.description && <p className="text-muted-foreground mt-1">{template.description}</p>}
          <p className="text-xs text-muted-foreground mt-1">Creado por {template.createdBy.name}</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <StartFlowDialog
              templates={allTemplates.map((t) => ({ id: t.id, name: t.name }))}
              projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            />
          )}
          {canEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/approvals/templates/${id}/edit`}>
                <Pencil className="h-4 w-4" /> Editar
              </Link>
            </Button>
          )}
          {canDelete && (
            <form action={async () => { "use server"; await deleteTemplateAction(id); redirect("/dashboard/approvals") }}>
              <Button type="submit" variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Pasos ({template.steps.length})</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {template.steps.map((step) => (
              <li key={step.id} className="flex items-center gap-3 rounded-lg border p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {step.order}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{step.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {step.approver.name ?? step.approver.email}
                  </p>
                </div>
                <Badge variant={step.required ? "default" : "outline"}>
                  {step.required ? "Obligatorio" : "Opcional"}
                </Badge>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
