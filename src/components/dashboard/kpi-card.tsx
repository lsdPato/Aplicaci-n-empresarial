"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"

type KpiCardProps = {
  label: string
  value: number
  icon: LucideIcon
  href: string
  accent: string
  glow: string
  iconBg: string
  alert?: boolean
}

export function KpiCard({ label, value, icon: Icon, href, accent, glow, iconBg, alert }: KpiCardProps) {
  return (
    <Link href={href}>
      <div
        className="group relative rounded-xl border p-4 cursor-pointer overflow-hidden transition-all duration-200"
        style={{
          background: "hsl(220,44%,7%)",
          borderColor: alert ? accent + "55" : "rgba(255,255,255,0.06)",
          boxShadow: alert ? `0 0 20px ${glow}` : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = accent + "80"
          e.currentTarget.style.boxShadow = `0 0 24px ${glow}`
          e.currentTarget.style.transform = "translateY(-2px)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = alert ? accent + "55" : "rgba(255,255,255,0.06)"
          e.currentTarget.style.boxShadow = alert ? `0 0 20px ${glow}` : "none"
          e.currentTarget.style.transform = "translateY(0)"
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }} />

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground leading-tight">{label}</p>
          <div style={{ padding: "6px", borderRadius: "8px", background: iconBg }}>
            <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
          </div>
        </div>

        <p className="text-3xl font-bold" style={{ color: alert ? accent : "rgba(226,232,240,0.95)" }}>
          {value}
        </p>
        {alert && value > 0 && (
          <p className="text-xs mt-1" style={{ color: accent + "cc" }}>Requiere atención</p>
        )}
      </div>
    </Link>
  )
}
