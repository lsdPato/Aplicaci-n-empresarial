"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { logoutAction } from "@/actions/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/generated/prisma/client"
import { LogOut, User as UserIcon, ChevronDown, Sun, Moon } from "lucide-react"

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  DIRECTOR: "Director",
  MEMBER: "Miembro",
  VIEWER: "Observador",
}

const roleColor: Record<string, { bg: string; text: string; glow: string }> = {
  ADMIN:    { bg: "rgba(124,58,237,0.18)", text: "#c4b5fd", glow: "rgba(124,58,237,0.4)" },
  DIRECTOR: { bg: "rgba(37,99,235,0.18)",  text: "#93c5fd", glow: "rgba(37,99,235,0.4)"  },
  MEMBER:   { bg: "rgba(5,150,105,0.18)",  text: "#6ee7b7", glow: "rgba(5,150,105,0.4)"  },
  VIEWER:   { bg: "rgba(100,116,139,0.18)",text: "#94a3b8", glow: "transparent"           },
}

export function Header({ user }: { user: User }) {
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const role = roleColor[user.role] ?? roleColor.VIEWER
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header
      className="flex h-16 items-center justify-between px-6"
      style={{
        background: "hsl(var(--card))",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      {/* Left — subtle brand line */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "2px", height: "16px", borderRadius: "2px",
          background: "linear-gradient(180deg, #7c3aed, #2563eb)",
          opacity: 0.6,
        }} />
        <span style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", letterSpacing: "0.02em" }}>
          Panel de control
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", borderRadius: "8px",
              background: "hsl(var(--accent))",
              border: "1px solid hsl(var(--border))",
              cursor: "pointer", color: "hsl(var(--muted-foreground))",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(var(--foreground))" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(var(--muted-foreground))" }}
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </button>
        )}

        {/* Role badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "4px 10px", borderRadius: "20px",
          background: role.bg,
          border: `1px solid ${role.glow}`,
          fontSize: "11px", fontWeight: 600,
          color: role.text, letterSpacing: "0.04em",
        }}>
          <span style={{
            width: "5px", height: "5px", borderRadius: "50%",
            background: role.text,
            boxShadow: `0 0 5px ${role.glow}`,
          }} />
          {roleLabel[user.role] ?? user.role}
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
              style={{ outline: "none", background: "transparent", border: "none", cursor: "pointer" }}
            >
              <div style={{
                padding: "2px", borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4)",
              }}>
                <Avatar className="h-8 w-8" style={{ display: "block" }}>
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? user.email} />
                  <AvatarFallback style={{ background: "hsl(var(--muted))", color: "#c4b5fd", fontSize: "12px", fontWeight: 600 }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="hidden sm:block text-left">
                <p style={{ fontSize: "13px", fontWeight: 500, color: "hsl(var(--foreground))", lineHeight: 1 }}>
                  {user.name?.split(" ")[0] ?? user.email}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            style={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
              minWidth: "200px",
            }}
          >
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>
                  {user.name ?? "Sin nombre"}
                </p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: "hsl(var(--border))" }} />
            <DropdownMenuItem asChild>
              <a href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                <UserIcon className="h-4 w-4" /> Perfil
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "hsl(var(--border))" }} />
            <DropdownMenuItem
              onSelect={() => logoutAction()}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
