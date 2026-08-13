"use client"

import { useEffect, useState } from "react"
import { fetchDonorWall, WallDonor } from "@/lib/api-client"
import { DonorAvatar } from "@/components/donor-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider } from "@/components/ui/tooltip"

const INITIAL_SKELETON_COUNT = 48

type DonorWallProps = {
  onStatsLoaded?: (stats: { count: number; totalRaised: number }) => void
}

export function DonorWall({ onStatsLoaded }: DonorWallProps) {
  const [donors, setDonors] = useState<WallDonor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setIsError(false)

    fetchDonorWall()
      .then((data) => {
        if (!isMounted) return
        setDonors(data)
        setIsLoading(false)

        const totalRaised = data.reduce((acc, curr) => acc + curr.amount, 0)
        onStatsLoaded?.({ count: data.length, totalRaised })
      })
      .catch(() => {
        if (!isMounted) return
        setIsError(true)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [onStatsLoaded])

  return (
    <section aria-label="Supporters" className="w-full">
      <TooltipProvider delay={50}>
        <div className="min-h-[140px] rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
          {isLoading ? (
            <div className="flex flex-wrap gap-1 md:gap-1.5 justify-center sm:justify-start">
              {Array.from({ length: INITIAL_SKELETON_COUNT }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[28px] w-[28px] rounded-full sm:h-[32px] sm:w-[32px]"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="flex min-h-[100px] items-center justify-center text-center text-xs text-muted-foreground">
              Couldn&apos;t load the wall — refresh to try again.
            </div>
          ) : donors.length === 0 ? (
            <div className="flex min-h-[100px] items-center justify-center text-center text-sm font-medium text-muted-foreground">
              Be the first supporter
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 md:gap-1.5 justify-center sm:justify-start">
              {donors.map((donor) => (
                <DonorAvatar
                  key={donor.id}
                  donorName={donor.donor_name}
                  amount={donor.amount}
                  avatarUrl={donor.avatar_url}
                  githubUsername={donor.github_username}
                />
              ))}
            </div>
          )}
        </div>
      </TooltipProvider>
    </section>
  )
}
