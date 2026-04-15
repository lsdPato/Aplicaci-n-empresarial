import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listTemplates, listMyPendingSteps } from "@/actions/approvals"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, GitMerge, Clock } from "lucide-react"

export default async function ApprovalsPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canView")) redirect("/dashboard")

  const [templates, myPending] = await Promise.all([listTemplates(), listMyPendingSteps()])
  const canCreate = canAccess(user, "approvals", "canCreate")

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Flujos de Aprobación</h1>
          <p className="text-muted-foreground">Gestiona plantillas y flujos activos</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/approvals/templates/new">
              <Plus className="h-4 w-4" /> Nueva plantilla
            </Link>
          </Button>
        )}
      </div>

      {/* My pending approvals */}
      {myPending.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-5 w-5" />
              Mis aprobaciones pendientes ({myPending.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myPending.map((step) => (
              <div key={step.id} className="flex items-center justify-between rounded border bg-white p-3">
                <div>
                  <p className="font-medium text-sm">{step.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.instance.template.name} → {step.instance.project.name}
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/approvals/instances/${step.instanceId}`}>Revisar</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Templates */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Plantillas</h2>
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <GitMerge className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No hay plantillas aún</p>
            {canCreate && (
              <Button asChild className="mt-4">
                <Link href="/dashboard/approvals/templates/new">Crear primera plantilla</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <Card key={t.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>{t._count.steps} pasos</span>
                    <span>·</span>
                    <span>{t._count.instances} instancias</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Por {t.createdBy.name}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/approvals/templates/${t.id}`}>Ver</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
