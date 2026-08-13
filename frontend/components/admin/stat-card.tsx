import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export type StatCardProps = {
  label: string
  value: string
  sublabel: string
  isLoading?: boolean
}

export function StatCard({ label, value, sublabel, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-1.5">
        <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 py-1">
            <Skeleton className="h-8 w-28 animate-pulse" />
            <Skeleton className="h-3 w-32 animate-pulse" />
          </div>
        ) : (
          <>
            <p className="font-mono tabular-nums text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            <p className="text-body-dash mt-1 text-xs text-muted-foreground">{sublabel}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
