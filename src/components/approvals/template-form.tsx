"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createTemplateAction, updateTemplateAction } from "@/actions/approvals"
import type { ActionState } from "@/types"
import { Plus, Trash2, GripVertical } from "lucide-react"

type User = { id: string; name: string | null; email: string }
type TemplateStep = {
  id: string
  order: number
  name: string
  approverId: string
  required: boolean
  approver: User
}
type Template = {
  id: string
  name: string
  description: string | null
  steps: TemplateStep[]
}

const initial: ActionState = { success: false }

type StepDraft = { name: string; approverId: string; required: boolean }

export function TemplateForm({
  template,
  users,
}: {
  template?: Template
  users: User[]
}) {
  const action = template ? updateTemplateAction : createTemplateAction
  const [state, formAction, isPending] = useActionState(action, initial)

  const [steps, setSteps] = useState<StepDraft[]>(
    template?.steps.map((s) => ({ name: s.name, approverId: s.approverId, required: s.required })) ?? [
      { name: "", approverId: "", required: true },
    ]
  )

  function addStep() {
    setSteps((prev) => [...prev, { name: "", approverId: "", required: true }])
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  function updateStep(index: number, field: keyof StepDraft, value: string | boolean) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{template ? "Editar plantilla" : "Nueva plantilla de aprobación"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {template && <input type="hidden" name="id" value={template.id} />}

          {state.error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la plantilla *</Label>
            <Input id="name" name="name" defaultValue={template?.name} required />
            {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" rows={2} defaultValue={template?.description ?? ""} />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pasos de aprobación</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4" /> Añadir paso
              </Button>
            </div>

            {steps.length === 0 && (
              <p className="text-sm text-destructive">Debes añadir al menos un paso</p>
            )}

            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start rounded-lg border p-3 bg-muted/30">
                  <div className="flex items-center pt-2 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-xs font-bold ml-1">{i + 1}</span>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {/* Hidden inputs for form submission */}
                    <input type="hidden" name="stepName" value={step.name} />
                    <input type="hidden" name="stepApprover" value={step.approverId} />
                    <input type="hidden" name="stepRequired" value={String(step.required)} />

                    <div className="space-y-1">
                      <Label className="text-xs">Nombre del paso</Label>
                      <Input
                        value={step.name}
                        onChange={(e) => updateStep(i, "name", e.target.value)}
                        placeholder="Ej: Revisión gerencia"
                        className="h-8 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Aprobador</Label>
                      <Select
                        value={step.approverId}
                        onValueChange={(v) => updateStep(i, "approverId", v)}
                      >
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name ?? u.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${i}`}
                        checked={step.required}
                        onChange={(e) => updateStep(i, "required", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`required-${i}`} className="text-xs cursor-pointer">
                        Paso obligatorio{" "}
                        <Badge variant="outline" className="text-xs ml-1">
                          {step.required ? "Si rechaza → flujo bloqueado" : "Opcional"}
                        </Badge>
                      </Label>
                    </div>
                  </div>
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8 mt-1"
                      onClick={() => removeStep(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending || steps.length === 0}>
              {isPending ? "Guardando..." : template ? "Actualizar plantilla" : "Crear plantilla"}
            </Button>
            <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
