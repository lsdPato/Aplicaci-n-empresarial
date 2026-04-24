"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateExpenseAction } from "@/actions/expenses"
import type { ActionState } from "@/types"
import type { Project, ExpenseCategory, Tag } from "@/generated/prisma/client"

const initial: ActionState = { success: false }

type Expense = {
  id: string
  type: "EXPENSE" | "INCOME"
  projectId: string
  categoryId: string | null
  description: string
  amount: string | number
  date: string | Date
  notes: string | null
  tags: Tag[]
}

export function TransactionEditForm({
  expense,
  projects,
  categories,
  tags,
}: {
  expense: Expense
  projects: Pick<Project, "id" | "name">[]
  categories: ExpenseCategory[]
  tags: Tag[]
}) {
  const [state, action, isPending] = useActionState(updateExpenseAction, initial)
  const [selectedTags, setSelectedTags] = useState<string[]>(expense.tags.map((t) => t.id))
  const [txType, setTxType] = useState<"EXPENSE" | "INCOME">(expense.type)

  function toggleTag(id: string) {
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])
  }

  const dateValue =
    expense.date instanceof Date
      ? expense.date.toISOString().split("T")[0]
      : new Date(expense.date).toISOString().split("T")[0]

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Editar transacción</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          {state.error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</div>
          )}

          <input type="hidden" name="id" value={expense.id} />

          {selectedTags.map((id) => (
            <input key={id} type="hidden" name="tagId" value={id} />
          ))}

          {/* Transaction type */}
          <div className="space-y-2">
            <Label>Tipo de transacción *</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTxType("EXPENSE")}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  txType === "EXPENSE"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border hover:bg-muted"
                }`}
              >
                Egreso
              </button>
              <button
                type="button"
                onClick={() => setTxType("INCOME")}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  txType === "INCOME"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-border hover:bg-muted"
                }`}
              >
                Ingreso
              </button>
            </div>
            <input type="hidden" name="type" value={txType} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proyecto *</Label>
              <Select name="projectId" defaultValue={expense.projectId}>
                <SelectTrigger><SelectValue placeholder="Selecciona proyecto" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.projectId && (
                <p className="text-xs text-destructive">{state.fieldErrors.projectId[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select name="categoryId" defaultValue={expense.categoryId ?? undefined}>
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
            <Input id="description" name="description" defaultValue={expense.description} required />
            {state.fieldErrors?.description && (
              <p className="text-xs text-destructive">{state.fieldErrors.description[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (USD) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={Number(expense.amount)}
                required
              />
              {state.fieldErrors?.amount && (
                <p className="text-xs text-destructive">{state.fieldErrors.amount[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input id="date" name="date" type="date" defaultValue={dateValue} required />
              {state.fieldErrors?.date && (
                <p className="text-xs text-destructive">{state.fieldErrors.date[0]}</p>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        active ? "shadow-sm" : "opacity-60 hover:opacity-100"
                      }`}
                      style={
                        active
                          ? { backgroundColor: tag.color + "22", borderColor: tag.color, color: tag.color }
                          : {}
                      }
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" rows={2} defaultValue={expense.notes ?? ""} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar cambios"}
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
