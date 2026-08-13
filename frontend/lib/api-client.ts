import type { Donation } from "@/lib/donations"

export function getBackendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8000"
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(`Invalid BACKEND_URL protocol: '${url}'. Must start with http:// or https://`)
  }
  return url
}

const BACKEND_URL = getBackendUrl()

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RAZORPAY_ID_PATTERN = /^[a-zA-Z0-9_]{8,64}$/
const RAZORPAY_SIGNATURE_PATTERN = /^[a-f0-9]{64}$/

// ─── Type Definitions ──────────────────────────────────────────────────────────

export type PlatformStats = {
  total_raised: number
  unique_donors: number
  active_campaigns?: number
}

export type OfflineDonationInput = {
  donor_name: string
  donor_email: string
  amount: number
}

export type WallDonor = {
  id: string
  donor_name: string
  amount: number
  avatar_url: string | null
  github_username: string | null
  created_at: string
}

export type PaymentVerificationInput = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

// ─── Stats & Donation Endpoints ────────────────────────────────────────────────

/** Fetch summary stats (total raised, unique donors) */
export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/donations/stats/summary`, { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to fetch stats")
    return (await res.json()) as PlatformStats
  } catch {
    return { total_raised: 0, unique_donors: 0 }
  }
}

/** Fetch all donation records for admin workspace */
export async function fetchDonations(): Promise<Donation[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/donations`, { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to fetch donations")
    return (await res.json()) as Donation[]
  } catch (err) {
    console.warn("Could not load donations from API", err)
    return []
  }
}

/** Post an offline donation */
export async function saveOfflineDonation(input: OfflineDonationInput): Promise<Donation> {
  const res = await fetch(`${BACKEND_URL}/api/v1/donations/offline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to save offline gift" }))
    throw new Error(err.detail || "Failed to save offline gift")
  }

  return (await res.json()) as Donation
}

/** Verify Razorpay payment and mark donation as completed */
export async function verifyPayment(input: PaymentVerificationInput): Promise<Donation> {
  if (!RAZORPAY_ID_PATTERN.test(input.razorpay_order_id)) {
    throw new Error(`Invalid order ID: '${input.razorpay_order_id}'`)
  }
  if (!RAZORPAY_ID_PATTERN.test(input.razorpay_payment_id)) {
    throw new Error(`Invalid payment ID: '${input.razorpay_payment_id}'`)
  }
  if (!RAZORPAY_SIGNATURE_PATTERN.test(input.razorpay_signature)) {
    throw new Error(`Invalid payment signature`)
  }
  const res = await fetch(`${BACKEND_URL}/api/v1/donations/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Payment verification failed" }))
    throw new Error(err.detail || "Payment verification failed")
  }

  return (await res.json()) as Donation
}

/** Delete a donation record (admin action) */
export async function deleteDonation(donationId: string): Promise<void> {
  if (!UUID_PATTERN.test(donationId)) {
    throw new Error(`Invalid donation ID: '${donationId}'`)
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/donations/${donationId}`, {
      method: "DELETE",
    })

    if (!res.ok && res.status !== 204 && res.status !== 200) {
      const err = await res.json().catch(() => ({ detail: "Failed to delete donation" }))
      throw new Error(err.detail || "Failed to delete donation")
    }
  } catch (err) {
    console.warn("Could not delete donation from API:", err)
    if (err instanceof Error && err.message !== "Failed to fetch") {
      throw err
    }
  }
}

/** Fetch public donor wall list */
export async function fetchDonorWall(): Promise<WallDonor[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/donations/wall`, { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to fetch donor wall")
    return (await res.json()) as WallDonor[]
  } catch (err) {
    console.warn("Could not load donor wall", err)
    return []
  }
}
