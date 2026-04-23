"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, FolderOpen, Receipt, Monitor, FileText,
  GitMerge, Settings, Building2
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { User } from "@/generated/prisma/client"
import { canAccess } from "@/lib/permissions"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: null },
  { href: "/dashboard/projects", label: "Proyectos", icon: FolderOpen, module: "projects" as const },
  { href: "/dashboard/expenses", label: "Gastos", icon: Receipt, module: "expenses" as const },
  { href: "/dashboard/assets", label: "Activos Digitales", icon: Monitor, module: "assets" as const },
  { href: "/dashboard/contracts", label: "Contratos", icon: FileText, module: "contracts" as const },
  { href: "/dashboard/approvals", label: "Aprobaciones", icon: GitMerge, module: "approvals" as const },
]

type UserWithPerms = User & { permissions?: Array<{ module: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean; canApprove: boolean }> }

export function Sidebar({ user }: { user: UserWithPerms }) {
  const pathname = usePathname()

  const visibleItems = navItems.filter((item) =>
    item.module === null || canAccess(user, item.module, "canView")
  )

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Building2 className="h-6 w-6 text-sidebar-primary" />
          <span className="text-sidebar-foreground">Gestión Startup</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="border-t px-3 py-4">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/dashboard/settings")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Configuración
        </Link>
      </div>
    </aside>
  )
}
