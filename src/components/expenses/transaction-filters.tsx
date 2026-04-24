"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import type { Tag } from "@/generated/prisma/client"

export function TransactionFilters({ tags }: { tags: Tag[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const type = searchParams.get("type") ?? "ALL"
  const status = searchParams.get("status") ?? "ALL"
  const tagId = searchParams.get("tagId") ?? ""
  const dateFrom = searchParams.get("dateFrom") ?? ""
  const dateTo = searchParams.get("dateTo") ?? ""

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "ALL") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  function clearDates() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("dateFrom")
    params.delete("dateTo")
    router.push(`${pathname}?${params.toString()}`)
  }

  const btnBase = "rounded-md px-3 py-1.5 text-xs font-medium border transition-colors"
  const active = "bg-foreground text-background border-foreground"
  const inactive = "border-border hover:bg-muted"

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border bg-card px-4 py-3">
      {/* Type filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Tipo:</span>
        <div className="flex gap-1">
          {[
            { value: "ALL", label: "Todos" },
            { value: "EXPENSE", label: "Egresos" },
            { value: "INCOME", label: "Ingresos" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("type", opt.value)}
              className={`${btnBase} ${type === opt.value ? active : inactive}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter (only relevant for expenses) */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Estado:</span>
        <div className="flex gap-1">
          {[
            { value: "ALL", label: "Todos" },
            { value: "PENDING", label: "Pendiente" },
            { value: "APPROVED", label: "Aprobado" },
            { value: "REJECTED", label: "Rechazado" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("status", opt.value)}
              className={`${btnBase} ${status === opt.value ? active : inactive}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Fecha:</span>
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {(dateFrom || dateTo) && (
            <button onClick={clearDates} className="text-xs text-muted-foreground hover:text-foreground underline ml-1">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Etiqueta:</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => update("tagId", "")}
              className={`${btnBase} ${!tagId ? active : inactive}`}
            >
              Todas
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => update("tagId", tagId === tag.id ? "" : tag.id)}
                className={`${btnBase} ${tagId === tag.id ? "shadow-sm" : "opacity-70 hover:opacity-100"}`}
                style={
                  tagId === tag.id
                    ? { backgroundColor: tag.color + "22", borderColor: tag.color, color: tag.color }
                    : {}
                }
              >
                <span className="inline-flex items-center gap-1">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
