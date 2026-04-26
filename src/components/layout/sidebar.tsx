"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, FolderOpen, Receipt, Monitor, FileText,
  GitMerge, Settings, Rocket,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { User } from "@/generated/prisma/client"
import { canAccess } from "@/lib/permissions"

const navItems = [
  { href: "/dashboard",          label: "Dashboard",         icon: LayoutDashboard, module: null },
  { href: "/dashboard/projects", label: "Proyectos",         icon: FolderOpen,      module: "projects"  as const },
  { href: "/dashboard/expenses", label: "Transacciones",     icon: Receipt,         module: "expenses"  as const },
  { href: "/dashboard/assets",   label: "Activos Digitales", icon: Monitor,         module: "assets"    as const },
  { href: "/dashboard/contracts",label: "Contratos",         icon: FileText,        module: "contracts" as const },
  { href: "/dashboard/approvals",label: "Aprobaciones",      icon: GitMerge,        module: "approvals" as const },
]

type UserWithPerms = User & {
  permissions?: Array<{
    module: string
    canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean; canApprove: boolean
  }>
}

export function Sidebar({ user }: { user: UserWithPerms }) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(
    (item) => item.module === null || canAccess(user, item.module, "canView")
  )

  return (
    <aside
      className="flex h-full w-64 flex-col border-r"
      style={{
        background: "linear-gradient(180deg, hsl(220,52%,4%) 0%, hsl(220,48%,5%) 100%)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center gap-3 px-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
          background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(37,99,235,0.9))",
          boxShadow: "0 0 16px rgba(124,58,237,0.4)",
        }}>
          <Rocket className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-white">Gestión</p>
          <p style={{ fontSize: "10px", color: "rgba(148,163,184,0.6)", marginTop: "2px" }}>Startup</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p style={{
          fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em",
          color: "rgba(100,116,139,0.7)", textTransform: "uppercase",
          padding: "0 8px 10px",
        }}>
          Menú
        </p>
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
                  style={isActive ? {
                    background: "linear-gradient(90deg, rgba(124,58,237,0.22) 0%, rgba(37,99,235,0.08) 100%)",
                    color: "#c4b5fd",
                  } : {
                    color: "rgba(148,163,184,0.75)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                      e.currentTarget.style.color = "rgba(226,232,240,0.9)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.color = "rgba(148,163,184,0.75)"
                    }
                  }}
                >
                  {/* Active left indicator */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                      style={{
                        width: "3px", height: "20px",
                        background: "linear-gradient(180deg, #a78bfa, #60a5fa)",
                        boxShadow: "0 0 8px rgba(167,139,250,0.6)",
                      }}
                    />
                  )}
                  <item.icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: isActive ? "#a78bfa" : "inherit" }}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px", marginTop: "0" }}>
        {(() => {
          const isActive = pathname.startsWith("/dashboard/settings")
          return (
            <Link
              href="/dashboard/settings"
              className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
              style={isActive ? {
                background: "linear-gradient(90deg, rgba(124,58,237,0.22) 0%, rgba(37,99,235,0.08) 100%)",
                color: "#c4b5fd",
              } : {
                color: "rgba(148,163,184,0.75)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                  e.currentTarget.style.color = "rgba(226,232,240,0.9)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "rgba(148,163,184,0.75)"
                }
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{
                    width: "3px", height: "20px",
                    background: "linear-gradient(180deg, #a78bfa, #60a5fa)",
                    boxShadow: "0 0 8px rgba(167,139,250,0.6)",
                  }}
                />
              )}
              <Settings className="h-4 w-4 shrink-0" style={{ color: isActive ? "#a78bfa" : "inherit" }} />
              Configuración
            </Link>
          )
        })()}
      </div>
    </aside>
  )
}
