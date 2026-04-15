"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createExpenseAction } from "@/actions/expenses"
import type { ActionState } from "@/types"
import type { Project, ExpenseCategory } from "@/generated/prisma"

const initial: ActionState = { success: false }

export function ExpenseForm({
  projects,
  categories,
  defaultProjectId,
}: {
  projects: Pick<Project, "id" | "name">[]
  categories: ExpenseCategory[]
  defaultProjectId?: string
}) {
  const [state, action, isPending] = useActionState(createExpenseAction, initial)

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Nuevo gasto</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          {state.error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proyecto *</Label>
              <Select name="projectId" defaultValue={defaultProjectId}>
                <SelectTrigger><SelectValue placeholder="Selecciona proyecto" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.projectId && <p className="text-xs text-destructive">{state.fieldErrors.projectId[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select name="categoryId">
                <SelectTrigger><SelectValue placeholder="Sin categoría" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Input id="description" name="description" required />
            {state.fieldErrors?.description && <p className="text-xs text-destructive">{state.fieldErrors.description[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (USD) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
              {state.fieldErrors?.amount && <p className="text-xs text-destructive">{state.fieldErrors.amount[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
              {state.fieldErrors?.date && <p className="text-xs text-destructive">{state.fieldErrors.date[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Registrar gasto"}
            </Button>
            <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
