import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { getInstance } from "@/actions/approvals"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InstanceTimeline } from "@/components/approvals/instance-timeline"
import { StepDecisionForm } from "@/components/approvals/step-decision-form"
import { formatDate } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

const instanceStatusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "info" }> = {
  PENDING:     { label: "Pendiente",    variant: "secondary" },
  IN_PROGRESS: { label: "En progreso",  variant: "warning" },
  APPROVED:    { label: "Aprobado",     variant: "success" },
  REJECTED:    { label: "Rechazado",    variant: "destructive" },
  BLOCKED:     { label: "Bloqueado",    variant: "destructive" },
}

export default async function InstanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canView")) redirect("/dashboard/approvals")

  const instance = await getInstance(id)
  if (!instance) notFound()

  const sc = instanceStatusConfig[instance.status] ?? { label: instance.status, variant: "secondary" as const }

  // Find the current step this user can decide on
  const myCurrentStep = instance.steps.find(
    (s) => s.approverId === user.id && s.status === "PENDING" && s.order === instance.currentStepOrder
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/approvals"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{instance.template.name}</h1>
          <p className="text-muted-foreground text-sm">
            Proyecto:{" "}
            <Link href={`/dashboard/projects/${instance.project.id}`} className="text-primary hover:underline">
              {instance.project.name}
            </Link>
          </p>
        </div>
      </div>

      {/* Status card */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Estado:</span>{" "}
              <Badge variant={sc.variant}>{sc.label}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Iniciado por:</span>{" "}
              <span className="font-medium">{instance.createdBy.name ?? instance.createdBy.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Fecha inicio:</span>{" "}
              <span>{formatDate(instance.createdAt)}</span>
            </div>
            {instance.completedAt && (
              <div>
                <span className="text-muted-foreground">Completado:</span>{" "}
                <span>{formatDate(instance.completedAt)}</span>
              </div>
            )}
          </div>

          {instance.status === "BLOCKED" && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              Este flujo está bloqueado porque un paso obligatorio fue rechazado.
            </div>
          )}
        </CardContent>
      </Card>

      {/* My action */}
      {myCurrentStep && instance.status === "IN_PROGRESS" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base text-primary">Tu turno: {myCurrentStep.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <StepDecisionForm instanceStepId={myCurrentStep.id} />
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-base">Progreso del flujo</CardTitle></CardHeader>
        <CardContent>
          <InstanceTimeline
            steps={instance.steps.map((s) => ({
              id: s.id,
              order: s.order,
              name: s.name,
              status: s.status,
              required: s.required,
              decision: s.decision,
              comment: s.comment,
              decidedAt: s.decidedAt,
              approver: s.approver,
            }))}
            currentStepOrder={instance.currentStepOrder}
          />
        </CardContent>
      </Card>
    </div>
  )
}
