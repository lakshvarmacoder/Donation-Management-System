"use client"

import { useState } from "react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/donations"
import { cn } from "@/lib/utils"

export type DonorAvatarProps = {
  donorName: string
  amount: number
  avatarUrl: string | null
  githubUsername: string | null
}

export function DonorAvatar({
  donorName,
  amount,
  avatarUrl,
  githubUsername,
}: DonorAvatarProps) {
  const truncatedName =
    donorName.length > 24 ? `${donorName.slice(0, 24)}...` : donorName
  const formattedAmount = formatCurrency(amount)
  const ariaLabel = `${donorName}, donated ${formattedAmount}`

  // Initial avatar source
  const initialAvatarSrc =
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      donorName
    )}&background=random&size=128&bold=true`

  const [imgSrc, setImgSrc] = useState(initialAvatarSrc)

  const handleImageError = () => {
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      donorName
    )}&background=random&size=128&bold=true`
    if (imgSrc !== fallback) {
      setImgSrc(fallback)
    }
  }

  const avatarElement = (
    <Image
      src={imgSrc}
      alt={ariaLabel}
      width={32}
      height={32}
      onError={handleImageError}
      className={cn(
        "h-[28px] w-[28px] sm:h-[32px] sm:w-[32px] rounded-full object-cover border border-border/40 shadow-2xs transition-transform duration-150 ease-out group-hover:scale-115 group-hover:shadow-md",
        !githubUsername && "opacity-90"
      )}
    />
  )

  const content = githubUsername ? (
    <a
      href={`https://github.com/${githubUsername}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="group relative inline-flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {avatarElement}
    </a>
  ) : (
    <div
      role="img"
      aria-label={ariaLabel}
      className="group relative inline-flex shrink-0 rounded-full select-none"
    >
      {avatarElement}
    </div>
  )

  return (
    <Tooltip>
      <TooltipTrigger>{content}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="font-sans font-medium text-xs">
        <span>
          {truncatedName} · <span className="font-mono">{formattedAmount}</span>
        </span>
      </TooltipContent>
    </Tooltip>
  )
}
