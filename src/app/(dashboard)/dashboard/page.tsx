import Link from "next/link"
import { redirect } from "next/navigation"
import { differenceInDays, format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { toPlain } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExpensesByMonthChart, ExpensesByCategoryChart } from "@/components/dashboard/expense-charts"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { FolderOpen, Receipt, Monitor, FileText, GitMerge, AlertTriangle, Clock, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const now = new Date()
  const sixMonthsAgo = subMonths(now, 5)

  const [
    activeProjects,
    pendingExpenses,
    expiringAssets,
    activeContracts,
    myPendingSteps,
    recentExpenses,
    projectsWithBudget,
    expensesByCategory,
    monthlyExpenseGroups,
    recentProjects,
    recentContracts,
  ] = await Promise.all([
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.expense.count({ where: { status: "PENDING" } }),
    prisma.digitalAsset.findMany({
      where: { expirationDate: { not: null }, status: "ACTIVE" },
      select: { id: true, name: true, expirationDate: true, alertDays: true },
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
    prisma.project.findMany({
      where: { status: "ACTIVE", budget: { not: null } },
      select: {
        id: true, name: true, budget: true,
        expenses: { where: { status: "APPROVED" }, select: { amount: true } },
      },
      take: 5,
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: { status: "APPROVED", date: { gte: sixMonthsAgo } },
      _sum: { amount: true },
    }),
    prisma.expense.findMany({
      where: { status: "APPROVED", date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
    }),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, status: true, createdAt: true },
    }),
    prisma.contract.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, createdAt: true },
    }),
  ])

  // Fetch category names for expense groups
  const categoryIds = expensesByCategory.map((g) => g.categoryId).filter(Boolean) as string[]
  const categories = categoryIds.length
    ? await prisma.expenseCategory.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
    : []

  const assetsNearExpiry = expiringAssets.filter((a) => {
    if (!a.expirationDate) return false
    const days = differenceInDays(new Date(a.expirationDate), now)
    return days >= 0 && days <= a.alertDays
  })

  // Build monthly chart data (last 6 months)
  const monthlyMap: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i)
    monthlyMap[format(d, "MMM", { locale: es })] = 0
  }
  monthlyExpenseGroups.forEach((e) => {
    const key = format(new Date(e.date), "MMM", { locale: es })
    if (key in monthlyMap) monthlyMap[key] += Number(e.amount)
  })
  const monthlyChartData = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }))

  // Build category chart data
  const categoryChartData = expensesByCategory
    .filter((g) => g._sum.amount)
    .map((g) => ({
      name: categories.find((c) => c.id === g.categoryId)?.name ?? "Sin categoría",
      total: Number(g._sum.amount),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  // Build budget progress data
  const budgetData = toPlain(projectsWithBudget.map((p) => ({
    id: p.id,
    name: p.name,
    budget: p.budget ? Number(p.budget) : null,
    spent: p.expenses.reduce((sum, e) => sum + Number(e.amount), 0),
  })))

  // Build activity feed
  const activityItems = [
    ...recentExpenses.map((e) => ({
      id: e.id, type: "expense" as const,
      title: e.description,
      subtitle: `${e.project.name} · ${e.category?.name ?? "Sin categoría"}`,
      date: e.date.toISOString(), status: e.status,
    })),
    ...recentProjects.map((p) => ({
      id: p.id, type: "project" as const,
      title: p.name, subtitle: "Proyecto creado",
      date: p.createdAt.toISOString(), status: p.status,
    })),
    ...recentContracts.map((c) => ({
      id: c.id, type: "contract" as const,
      title: c.title, subtitle: "Contrato",
      date: c.createdAt.toISOString(), status: c.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  const kpis = [
    {
      label: "Proyectos activos", value: activeProjects, icon: FolderOpen,
      href: "/dashboard/projects",
      accent: "#2563eb", glow: "rgba(37,99,235,0.3)", iconBg: "rgba(37,99,235,0.15)",
    },
    {
      label: "Gastos pendientes", value: pendingExpenses, icon: Receipt,
      href: "/dashboard/expenses", alert: pendingExpenses > 0,
      accent: "#d97706", glow: "rgba(217,119,6,0.3)", iconBg: "rgba(217,119,6,0.15)",
    },
    {
      label: "Activos por vencer", value: assetsNearExpiry.length, icon: Monitor,
      href: "/dashboard/assets", alert: assetsNearExpiry.length > 0,
      accent: "#ea580c", glow: "rgba(234,88,12,0.3)", iconBg: "rgba(234,88,12,0.15)",
    },
    {
      label: "Contratos activos", value: activeContracts, icon: FileText,
      href: "/dashboard/contracts",
      accent: "#059669", glow: "rgba(5,150,105,0.3)", iconBg: "rgba(5,150,105,0.15)",
    },
    {
      label: "Mis aprobaciones", value: myPendingSteps, icon: GitMerge,
      href: "/dashboard/approvals", alert: myPendingSteps > 0,
      accent: "#7c3aed", glow: "rgba(124,58,237,0.3)", iconBg: "rgba(124,58,237,0.15)",
    },
  ]

  const totalApprovedLast6m = monthlyChartData.reduce((s, d) => s + d.total, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{
          background: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Bienvenido, {user.name?.split(" ")[0] ?? "Usuario"}
        </h1>
        <p className="text-muted-foreground text-sm">Resumen operativo de tu empresa</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <div
              className="group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer overflow-hidden"
              style={{
                background: "hsl(220,44%,7%)",
                borderColor: kpi.alert ? kpi.accent + "55" : "rgba(255,255,255,0.06)",
                boxShadow: kpi.alert ? `0 0 20px ${kpi.glow}` : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = kpi.accent + "80"
                e.currentTarget.style.boxShadow = `0 0 24px ${kpi.glow}`
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = kpi.alert ? kpi.accent + "55" : "rgba(255,255,255,0.06)"
                e.currentTarget.style.boxShadow = kpi.alert ? `0 0 20px ${kpi.glow}` : "none"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: `linear-gradient(90deg, ${kpi.accent}, transparent)`,
              }} />

              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground leading-tight">{kpi.label}</p>
                <div style={{
                  padding: "6px", borderRadius: "8px",
                  background: kpi.iconBg,
                }}>
                  <kpi.icon className="h-3.5 w-3.5" style={{ color: kpi.accent }} />
                </div>
              </div>

              <p className="text-3xl font-bold" style={{ color: kpi.alert ? kpi.accent : "rgba(226,232,240,0.95)" }}>
                {kpi.value}
              </p>
              {kpi.alert && kpi.value > 0 && (
                <p className="text-xs mt-1" style={{ color: kpi.accent + "cc" }}>
                  Requiere atención
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Gastos aprobados (6 meses)</span>
              <span className="text-sm font-normal text-muted-foreground">${totalApprovedLast6m.toLocaleString()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesByMonthChart data={monthlyChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4" /> Gastos por categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0
              ? <ExpensesByCategoryChart data={categoryChartData} />
              : <p className="text-sm text-muted-foreground py-16 text-center">Sin gastos aprobados aún</p>
            }
          </CardContent>
        </Card>
      </div>

      {/* Budget + Activity row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4" /> Presupuesto por proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetProgress projects={budgetData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" /> Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={activityItems} />
          </CardContent>
        </Card>
      </div>

      {/* Alerts row */}
      {(assetsNearExpiry.length > 0 || recentExpenses.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {assetsNearExpiry.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-orange-700 text-base">
                  <AlertTriangle className="h-4 w-4" /> Activos próximos a vencer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {assetsNearExpiry.slice(0, 4).map((a) => {
                  const days = differenceInDays(new Date(a.expirationDate!), now)
                  return (
                    <div key={a.id} className="flex items-center justify-between rounded border p-2 text-sm">
                      <span className="font-medium">{a.name}</span>
                      <Badge variant={days <= 7 ? "destructive" : "warning"}>
                        {days === 0 ? "Hoy" : `${days}d`}
                      </Badge>
                    </div>
                  )
                })}
                <Button variant="outline" size="sm" asChild className="w-full mt-1">
                  <Link href="/dashboard/assets">Ver todos</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {recentExpenses.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" /> Gastos pendientes de aprobación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentExpenses.slice(0, 4).map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded border p-2 text-sm">
                    <div>
                      <p className="font-medium">{e.description}</p>
                      <p className="text-xs text-muted-foreground">{e.project.name} · {e.category?.name ?? "Sin categoría"}</p>
                    </div>
                    <span className="font-semibold">${Number(e.amount).toLocaleString()}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" asChild className="w-full mt-1">
                  <Link href="/dashboard/expenses">Ver todos</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
