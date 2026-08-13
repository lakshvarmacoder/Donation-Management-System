"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/donations"

interface StatsCounterProps {
  stats: { count: number; totalRaised: number } | null
}

export function StatsCounter({ stats }: StatsCounterProps) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm font-medium text-foreground tracking-tight">
      {stats === null ? (
        <Skeleton className="h-6 w-48 rounded-md" />
      ) : (
        <p>
          {stats.count} {stats.count === 1 ? "supporter" : "supporters"} · {formatCurrency(stats.totalRaised)} raised
        </p>
      )}
    </div>
  )
}
