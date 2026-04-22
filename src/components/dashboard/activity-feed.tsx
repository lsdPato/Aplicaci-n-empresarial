"use client"

import { formatDate } from "@/lib/utils"
import { Receipt, FolderOpen, FileText, Monitor } from "lucide-react"

type ActivityItem = {
  id: string
  type: "expense" | "project" | "contract" | "asset"
  title: string
  subtitle: string
  date: string
  status?: string
}

const icons = {
  expense: Receipt,
  project: FolderOpen,
  contract: FileText,
  asset: Monitor,
}

const statusColors: Record<string, string> = {
  APPROVED: "text-green-600",
  REJECTED: "text-red-600",
  PENDING: "text-yellow-600",
  ACTIVE: "text-green-600",
  DRAFT: "text-muted-foreground",
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Sin actividad reciente</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = icons[item.type]
        return (
          <div key={item.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <div className="text-right shrink-0">
              {item.status && (
                <p className={`text-xs font-medium ${statusColors[item.status] ?? "text-muted-foreground"}`}>
                  {item.status}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
