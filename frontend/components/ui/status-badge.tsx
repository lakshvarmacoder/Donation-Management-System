import React from "react"
import { Badge } from "@/components/ui/badge"

export type SystemStatus =
  | "completed"
  | "pending"
  | "failed"
  | "refunded"
  | "active"
  | "draft"
  | "archived"
  | string

type StatusBadgeProps = {
  status: SystemStatus
  className?: string
}

/**
 * Modern Status Badge using standard shadcn/ui <Badge> with 2026 color design tokens.
 * Clean, soft background tints, high contrast text, and subtle borders.
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase()

  switch (normalized) {
    case "completed":
    case "active":
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 font-medium capitalize shadow-none ${className}`}
        >
          {status}
        </Badge>
      )
    case "pending":
    case "draft":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 font-medium capitalize shadow-none ${className}`}
        >
          {status}
        </Badge>
      )
    case "failed":
      return (
        <Badge
          variant="outline"
          className={`bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800/60 font-medium capitalize shadow-none ${className}`}
        >
          {status}
        </Badge>
      )
    case "refunded":
    case "archived":
    default:
      return (
        <Badge
          variant="secondary"
          className={`font-medium capitalize shadow-none ${className}`}
        >
          {status}
        </Badge>
      )
  }
}
