"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, Download, RefreshCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"

import { StatCard } from "@/components/admin/stat-card"
import { DonationTable } from "@/components/admin/donation-table"

import { Donation, formatCurrency } from "@/lib/donations"
import {
  deleteDonation,
  fetchDonations,
  fetchPlatformStats,
  PlatformStats,
} from "@/lib/api-client"

// ─── Export CSV Utility ────────────────────────────────────────────────────────

function downloadCsvFile(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function exportDonationsCSV(donations: Donation[]) {
  if (donations.length === 0) return

  const headers = ["Donation ID", "Donor Name", "GitHub Username", "Amount (INR)", "Source", "Created At"]
  const rows = donations.map((d) => [
    d.id,
    `"${d.donor_name.replace(/"/g, '""')}"`,
    d.github_username || "",
    d.amount,
    d.source,
    d.created_at,
  ])

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const filename = `donations-report-${new Date().toISOString().split("T")[0]}.csv`
  downloadCsvFile(csvContent, filename)
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  stats,
  donations,
  isLoading,
  onExport,
  onDeleteDonation,
}: {
  stats: PlatformStats
  donations: Donation[]
  isLoading: boolean
  onExport: () => void
  onDeleteDonation: (id: string) => Promise<void>
}) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-heading-dash text-2xl font-semibold tracking-tight">Good morning, Admin.</h2>
          <p className="text-body-dash text-xs text-muted-foreground mt-0.5">Here is a real-time summary of donor wall activity.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onExport} disabled={isLoading || donations.length === 0} className="gap-1.5">
          <Download className="size-3.5" />
          Export report
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total raised"
          value={formatCurrency(stats.total_raised)}
          sublabel="All time contributions"
          isLoading={isLoading}
        />
        <StatCard
          label="Unique donors"
          value={String(stats.unique_donors)}
          sublabel="Verified supporters"
          isLoading={isLoading}
        />
        <StatCard
          label="Total donations"
          value={String(donations.length)}
          sublabel="Online records"
          isLoading={isLoading}
        />
      </div>

      {/* Recent activity table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-heading-dash text-sm font-semibold">Recent Donations</h3>
          <span className="text-xs text-muted-foreground">Latest activity</span>
        </div>
        <DonationTable donations={donations.slice(0, 5)} onDelete={onDeleteDonation} isLoading={isLoading} />
      </div>
    </div>
  )
}

// ─── Donations Tab ─────────────────────────────────────────────────────────────

function DonationsTab({
  donations,
  query,
  isLoading,
  onQuery,
  onDeleteDonation,
}: {
  donations: Donation[]
  query: string
  isLoading: boolean
  onQuery: (q: string) => void
  onDeleteDonation: (id: string) => Promise<void>
}) {
  const filtered = useMemo(
    () =>
      donations.filter((d) =>
        `${d.donor_name} ${d.github_username || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [donations, query]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-heading-dash text-xl font-semibold tracking-tight">Donation Records</h2>
          <p className="text-body-dash text-xs text-muted-foreground mt-0.5">Search and inspect all online gift records.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8 text-body-dash text-xs"
            placeholder="Search donor name or GitHub username"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </div>
      </div>
      <DonationTable donations={filtered} onDelete={onDeleteDonation} isLoading={isLoading} />
    </div>
  )
}

// ─── Admin Dashboard (root) ────────────────────────────────────────────────────

export function AdminDashboard() {
  const [query, setQuery] = useState("")
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<PlatformStats>({
    total_raised: 0,
    unique_donors: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [dData, sData] = await Promise.all([
        fetchDonations(),
        fetchPlatformStats(),
      ])
      setDonations(dData)
      setStats(sData)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data."
      setErrorMessage(msg)
      console.error("Failed to load dashboard data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const handleDeleteDonation = useCallback(async (donationId: string) => {
    setErrorMessage(null)
    try {
      await deleteDonation(donationId)
      await refreshData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete donation record."
      setErrorMessage(msg)
      console.error("Failed to delete donation:", err)
    }
  }, [refreshData])

  return (
    <div className="min-h-screen bg-background text-body-dash">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Internal Workspace
            </span>
            <h1 className="text-heading-dash text-lg font-semibold">Donation Management Platform</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
              className="gap-1.5 text-xs font-medium"
              title="Refresh dashboard data"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Fetching..." : "Refresh"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 py-8">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Tabs defaultValue="overview">
          <TabsList
            variant="line"
            className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto gap-6"
          >
            <TabsTrigger value="overview" className="pb-3 rounded-none text-xs font-medium">Overview</TabsTrigger>
            <TabsTrigger value="donations" className="pb-3 rounded-none text-xs font-medium">Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab
              stats={stats}
              donations={donations}
              isLoading={isLoading}
              onExport={() => exportDonationsCSV(donations)}
              onDeleteDonation={handleDeleteDonation}
            />
          </TabsContent>
          <TabsContent value="donations" className="mt-6">
            <DonationsTab
              donations={donations}
              query={query}
              isLoading={isLoading}
              onQuery={setQuery}
              onDeleteDonation={handleDeleteDonation}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
