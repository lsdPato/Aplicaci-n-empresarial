"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { submitDecisionAction } from "@/actions/approvals"
import type { ActionState } from "@/types"
import { Check, X } from "lucide-react"

const initial: ActionState = { success: false }

export function StepDecisionForm({ instanceStepId }: { instanceStepId: string }) {
  const [state, action, isPending] = useActionState(submitDecisionAction, initial)

  if (state.success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        Decisión registrada correctamente.
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4 rounded-lg border bg-card p-4">
      <input type="hidden" name="instanceStepId" value={instanceStepId} />

      {state.error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="comment">Comentario (opcional)</Label>
        <Textarea id="comment" name="comment" rows={3} placeholder="Escribe un comentario o justificación..." />
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          name="decision"
          value="APPROVED"
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="h-4 w-4" />
          {isPending ? "Procesando..." : "Aprobar"}
        </Button>
        <Button
          type="submit"
          name="decision"
          value="REJECTED"
          variant="destructive"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          {isPending ? "Procesando..." : "Rechazar"}
        </Button>
      </div>
    </form>
  )
}
