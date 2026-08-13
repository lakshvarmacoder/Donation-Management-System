"use client"

import { useState } from "react"
import { ExternalLink, Loader2, ReceiptText, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Donation, formatCurrency } from "@/lib/donations"

const SKELETON_ROW_COUNT = 5

type DonationTableProps = {
  donations: Donation[]
  onDelete?: (donationId: string) => Promise<void> | void
  isLoading?: boolean
}

export function DonationTableSkeleton({ hasAction = false }: { hasAction?: boolean }) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Donor</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</TableHead>
            {hasAction && <TableHead className="w-12 text-right pr-4">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="pl-4 py-3">
                <Skeleton className="h-4 w-36 mb-1.5 animate-pulse" />
                <Skeleton className="h-3 w-48 animate-pulse" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 animate-pulse" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full animate-pulse" />
              </TableCell>
              {hasAction && (
                <TableCell className="pr-4 text-right">
                  <Skeleton className="h-8 w-8 rounded-md ml-auto animate-pulse" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

export function DonationTable({ donations, onDelete, isLoading }: DonationTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!onDelete) return
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <DonationTableSkeleton hasAction={!!onDelete} />
  }

  if (donations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <ReceiptText className="size-10 text-muted-foreground/40 mb-3" />
          <h4 className="text-base font-semibold text-foreground">No donations recorded yet</h4>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm leading-relaxed">
            Test the online donation checkout to feature support on the wall.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Donor</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</TableHead>
            {onDelete && <TableHead className="w-12 text-right pr-4">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.map((donation) => {
            const isDeleting = deletingId === donation.id
            return (
              <TableRow key={donation.id} className={isDeleting ? "opacity-50 transition-opacity" : ""}>
                <TableCell className="pl-4 py-3">
                  <p className="text-sm font-medium text-foreground">{donation.donor_name}</p>
                  {donation.github_username ? (
                    <a
                      href={`https://github.com/${donation.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 underline font-mono inline-flex items-center gap-1 mt-0.5"
                    >
                      https://github.com/{donation.github_username}
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Offline Donor</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(donation.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-[10px] tracking-wide font-medium">
                    {donation.source}
                  </Badge>
                </TableCell>
                {onDelete && (
                  <TableCell className="pr-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      disabled={isDeleting}
                      onClick={() => handleDelete(donation.id)}
                      title="Delete donation record"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-3.5 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
