"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"]

type MonthlyData = { month: string; total: number }
type CategoryData = { name: string; total: number }

export function ExpensesByMonthChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Total"]} />
        <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ExpensesByCategoryChart({ data }: { data: CategoryData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Total"]} />
        <Legend iconSize={10} formatter={(v) => <span className="text-xs">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
