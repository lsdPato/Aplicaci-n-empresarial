"use client"

import { differenceInDays } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export function ExpiryBadge({ expirationDate, alertDays }: { expirationDate: Date | null; alertDays: number }) {
  if (!expirationDate) return <span className="text-muted-foreground text-sm">—</span>

  const daysLeft = differenceInDays(new Date(expirationDate), new Date())
  const label = formatDate(expirationDate)

  if (daysLeft < 0) return <Badge variant="destructive">Vencido ({label})</Badge>
  if (daysLeft <= 7) return <Badge variant="destructive">Vence en {daysLeft}d ({label})</Badge>
  if (daysLeft <= alertDays) return <Badge variant="warning">Vence en {daysLeft}d ({label})</Badge>
  return <Badge variant="success">{label}</Badge>
}
