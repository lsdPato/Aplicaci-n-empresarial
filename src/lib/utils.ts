import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "—"
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date))
}

export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}
