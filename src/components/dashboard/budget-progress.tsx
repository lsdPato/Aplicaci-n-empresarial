"use client"

import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

type ProjectBudget = {
  id: string
  name: string
  budget: number | null
  spent: number
}

export function BudgetProgress({ projects }: { projects: ProjectBudget[] }) {
  const withBudget = projects.filter((p) => p.budget && p.budget > 0)
  if (withBudget.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Sin proyectos con presupuesto definido</p>
  }

  return (
    <div className="space-y-4">
      {withBudget.map((p) => {
        const pct = Math.min(100, Math.round((p.spent / p.budget!) * 100))
        const over = p.spent > p.budget!
        return (
          <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="block space-y-1 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[60%]">{p.name}</span>
              <span className={`text-xs ${over ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                {formatCurrency(p.spent)} / {formatCurrency(p.budget!)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${over ? "bg-destructive" : pct > 80 ? "bg-orange-500" : "bg-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{pct}% utilizado</p>
          </Link>
        )
      })}
    </div>
  )
}
