import { Skeleton } from "@/components/ui/skeleton"

export default function ContractsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="rounded-lg border bg-card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
