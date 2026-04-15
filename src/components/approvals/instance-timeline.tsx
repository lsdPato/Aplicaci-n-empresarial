"use client"

import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Check, X, Clock, SkipForward } from "lucide-react"

type Step = {
  id: string
  order: number
  name: string
  status: string
  required: boolean
  decision: string | null
  comment: string | null
  decidedAt: Date | null
  approver: { id: string; name: string | null; email: string }
}

const iconMap: Record<string, React.ReactNode> = {
  APPROVED: <Check className="h-4 w-4" />,
  REJECTED: <X className="h-4 w-4" />,
  SKIPPED: <SkipForward className="h-4 w-4" />,
  PENDING: <Clock className="h-4 w-4" />,
}

const colorMap: Record<string, string> = {
  APPROVED: "bg-green-100 border-green-400 text-green-700",
  REJECTED: "bg-red-100 border-red-400 text-red-700",
  SKIPPED: "bg-gray-100 border-gray-400 text-gray-500",
  PENDING: "bg-yellow-50 border-yellow-300 text-yellow-700",
}

export function InstanceTimeline({
  steps,
  currentStepOrder,
}: {
  steps: Step[]
  currentStepOrder: number
}) {
  return (
    <ol className="relative border-l border-border ml-4 space-y-6">
      {steps.map((step) => {
        const isCurrent = step.order === currentStepOrder && step.status === "PENDING"
        const color = colorMap[step.status] ?? colorMap["PENDING"]
        return (
          <li key={step.id} className="ml-6">
            <span
              className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border-2 ${color} ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}`}
            >
              {iconMap[step.status]}
            </span>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Paso {step.order}</span>
                  {!step.required && <Badge variant="outline" className="text-xs">Opcional</Badge>}
                  {isCurrent && <Badge variant="warning" className="text-xs">En curso</Badge>}
                </div>
                <Badge
                  variant={
                    step.status === "APPROVED" ? "success" :
                    step.status === "REJECTED" ? "destructive" :
                    step.status === "SKIPPED" ? "secondary" : "warning"
                  }
                >
                  {step.status === "APPROVED" ? "Aprobado" :
                   step.status === "REJECTED" ? "Rechazado" :
                   step.status === "SKIPPED" ? "Omitido" : "Pendiente"}
                </Badge>
              </div>
              <p className="font-medium">{step.name}</p>
              <p className="text-sm text-muted-foreground">
                Aprobador: {step.approver.name ?? step.approver.email}
              </p>
              {step.decidedAt && (
                <p className="text-xs text-muted-foreground mt-1">{formatDate(step.decidedAt)}</p>
              )}
              {step.comment && (
                <div className="mt-2 rounded bg-muted px-3 py-2 text-sm italic">
                  "{step.comment}"
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
