import { Badge } from "@/components/ui/badge"
import type { ProjectStatus } from "@/generated/prisma"

const statusConfig: Record<ProjectStatus, { label: string; variant: "success" | "warning" | "secondary" }> = {
  ACTIVE: { label: "Activo", variant: "success" },
  PAUSED: { label: "Pausado", variant: "warning" },
  CLOSED: { label: "Cerrado", variant: "secondary" },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
