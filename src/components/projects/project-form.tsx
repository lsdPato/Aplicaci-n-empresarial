"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createProjectAction, updateProjectAction } from "@/actions/projects"
import { formatDateInput } from "@/lib/utils"
import type { ActionState } from "@/types"
import type { Project } from "@/generated/prisma"

const initial: ActionState = { success: false }

export function ProjectForm({ project }: { project?: Project }) {
  const action = project ? updateProjectAction : createProjectAction
  const [state, formAction, isPending] = useActionState(action, initial)

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{project ? "Editar proyecto" : "Nuevo proyecto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {project && <input type="hidden" name="id" value={project.id} />}
          {state.error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" name="name" defaultValue={project?.name} required />
            {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={project?.description ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select name="status" defaultValue={project?.status ?? "ACTIVE"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="PAUSED">Pausado</SelectItem>
                  <SelectItem value="CLOSED">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto (USD)</Label>
              <Input id="budget" name="budget" type="number" step="0.01" min="0"
                defaultValue={project?.budget?.toString() ?? ""} />
              {state.fieldErrors?.budget && <p className="text-xs text-destructive">{state.fieldErrors.budget[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha inicio</Label>
              <Input id="startDate" name="startDate" type="date"
                defaultValue={formatDateInput(project?.startDate)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha fin</Label>
              <Input id="endDate" name="endDate" type="date"
                defaultValue={formatDateInput(project?.endDate)} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : project ? "Actualizar" : "Crear proyecto"}
            </Button>
            <Button type="button" variant="outline" onClick={() => history.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
