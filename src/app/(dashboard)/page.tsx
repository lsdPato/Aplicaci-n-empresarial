import Link from "next/link"
import { redirect } from "next/navigation"
import { differenceInDays } from "date-fns"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import {
  FolderOpen, Receipt, Monitor, FileText, GitMerge, AlertTriangle, Clock,
} from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Parallel data fetch
  const [
    activeProjects,
    pendingExpenses,
    expiringAssets,
    activeContracts,
    myPendingSteps,
    recentExpenses,
  ] = await Promise.all([
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.expense.count({ where: { status: "PENDING" } }),
    prisma.digitalAsset.findMany({
      where: { expirationDate: { not: null }, status: "ACTIVE" },
      select: { id: true, name: true, type: true, expirationDate: true, alertDays: true },
    }),
    prisma.contract.count({ where: { status: "ACTIVE" } }),
    prisma.approvalInstanceStep.count({
      where: { approverId: user.id, status: "PENDING", instance: { status: "IN_PROGRESS" } },
    }),
    prisma.expense.findMany({
      take: 5,
      where: { status: "PENDING" },
      include: { project: { select: { name: true } }, category: { select: { name: true } } },
      orderBy: { date: "desc" },
    }),
  ])

  const assetsNearExpiry = expiringAssets.filter((a) => {
    if (!a.expirationDate) return false
    const days = differenceInDays(new Date(a.expirationDate), new Date())
    return days >= 0 && days <= a.alertDays
  })

  const kpis = [
    { label: "Proyectos activos", value: activeProjects, icon: FolderOpen, href: "/dashboard/projects", color: "text-blue-600" },
    { label: "Gastos pendientes", value: pendingExpenses, icon: Receipt, href: "/dashboard/expenses", color: "text-yellow-600", alert: pendingExpenses > 0 },
    { label: "Activos por vencer", value: assetsNearExpiry.length, icon: Monitor, href: "/dashboard/assets", color: "text-orange-500", alert: assetsNearExpiry.length > 0 },
    { label: "Contratos activos", value: activeContracts, icon: FileText, href: "/dashboard/contracts", color: "text-green-600" },
    { label: "Aprobaciones pendientes", value: myPendingSteps, icon: GitMerge, href: "/dashboard/approvals", color: "text-purple-600", alert: myPendingSteps > 0 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido, {user.name?.split(" ")[0] ?? "Usuario"}</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu empresa</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <Card className={`hover:border-primary/50 transition-colors cursor-pointer ${kpi.alert ? "border-orange-200 bg-orange-50/40" : ""}`}>
              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${kpi.alert ? "text-orange-600" : ""}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expiring assets alert */}
        {assetsNearExpiry.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 text-base">
                <AlertTriangle className="h-4 w-4" /> Activos próximos a vencer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assetsNearExpiry.slice(0, 5).map((a) => {
                const days = differenceInDays(new Date(a.expirationDate!), new Date())
                return (
                  <div key={a.id} className="flex items-center justify-between rounded border p-2 text-sm">
                    <span className="font-medium">{a.name}</span>
                    <Badge variant={days <= 7 ? "destructive" : "warning"}>
                      {days === 0 ? "Hoy" : `${days}d`}
                    </Badge>
                  </div>
                )
              })}
              <Button variant="outline" size="sm" asChild className="w-full mt-2">
                <Link href="/dashboard/assets">Ver todos los activos</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent pending expenses */}
        {recentExpenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" /> Gastos pendientes de aprobación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded border p-2 text-sm">
                  <div>
                    <p className="font-medium">{e.description}</p>
                    <p className="text-xs text-muted-foreground">{e.project.name} · {e.category?.name ?? "Sin categoría"}</p>
                  </div>
                  <span className="font-semibold">{formatCurrency(e.amount.toString())}</span>
                </div>
              ))}
              <Button variant="outline" size="sm" asChild className="w-full mt-2">
                <Link href="/dashboard/expenses">Ver todos los gastos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
