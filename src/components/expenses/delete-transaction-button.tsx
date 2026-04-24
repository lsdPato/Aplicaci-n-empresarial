"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteExpenseAction } from "@/actions/expenses"

export function DeleteTransactionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("¿Eliminar esta transacción? Esta acción no se puede deshacer.")) return
    startTransition(async () => {
      await deleteExpenseAction(id)
    })
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
      onClick={handleDelete}
      disabled={isPending}
      title="Eliminar"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
