import { Skeleton } from "@/components/ui/skeleton"

export default function ExpensesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-24" />)}
      </div>
      <div className="rounded-lg border bg-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
