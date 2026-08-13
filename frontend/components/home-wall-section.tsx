"use client"

import { useCallback, useState } from "react"
import { StatsCounter } from "@/components/stats-counter"
import { DonorWall } from "@/components/donor-wall"

export function HomeWallSection() {
  const [stats, setStats] = useState<{ count: number; totalRaised: number } | null>(null)

  const handleStatsLoaded = useCallback(
    (newStats: { count: number; totalRaised: number }) => {
      setStats(newStats)
    },
    []
  )

  return (
    <div className="flex flex-col gap-12 sm:gap-16 w-full">
      <StatsCounter stats={stats} />
      
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">Supporters</h2>
        <DonorWall onStatsLoaded={handleStatsLoaded} />
      </section>
    </div>
  )
}
