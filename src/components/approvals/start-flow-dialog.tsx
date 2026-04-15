"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createInstanceAction } from "@/actions/approvals"
import type { ActionState } from "@/types"
import { GitMerge } from "lucide-react"

type Template = { id: string; name: string }
type Project = { id: string; name: string }

const initial: ActionState = { success: false }

export function StartFlowDialog({
  templates,
  projects,
  defaultProjectId,
}: {
  templates: Template[]
  projects: Project[]
  defaultProjectId?: string
}) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(createInstanceAction, initial)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <GitMerge className="h-4 w-4" /> Iniciar flujo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar flujo de aprobación</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</div>
          )}

          <div className="space-y-2">
            <Label>Plantilla de aprobación</Label>
            <Select name="templateId" required>
              <SelectTrigger><SelectValue placeholder="Selecciona una plantilla..." /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proyecto</Label>
            <Select name="projectId" defaultValue={defaultProjectId} required>
              <SelectTrigger><SelectValue placeholder="Selecciona un proyecto..." /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Iniciando..." : "Iniciar flujo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
