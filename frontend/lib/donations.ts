export type Donation = {
  id: string
  donor_name: string
  donor_email?: string | null
  donor_phone?: string | null
  github_username?: string | null
  avatar_url?: string | null
  amount: number
  currency: string
  source: "online" | "offline"
  status: "pending" | "completed" | "failed" | "refunded"
  created_at: string
}

export const formatCurrency = (amount: number, currency: string = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
