import "server-only"

import { getBackendUrl } from "@/lib/api-client"
import type { DonationRequest } from "@/lib/donations/request"
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/payments/razorpay"

type DonationPreparation =
  | { mode: "demo"; donationId: string; orderId: string; keyId: string }
  | { mode: "razorpay"; donationId: string; orderId: string; keyId: string }
  | { error: string; status: number }

/** Coordinates persistence and payment creation via FastAPI backend or direct server config. */
export async function prepareDonation(input: DonationRequest): Promise<DonationPreparation> {
  const backendUrl = getBackendUrl()
  // 1. Try delegating to FastAPI backend if available
  try {
    const backendRes = await fetch(`${backendUrl}/api/v1/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        github_username: input.githubUsername,
        donor_name: input.donorName || input.githubUsername,
        donor_email: `${input.githubUsername}@users.noreply.github.com`,
        amount: input.amount,
        currency: "INR",
      }),
      cache: "no-store",
    })

    if (backendRes.ok) {
      const data = await backendRes.json()
      const isDemoOrder = String(data.order_id).startsWith("order_demo_")
      return {
        mode: isDemoOrder ? "demo" : "razorpay",
        donationId: data.donation_id,
        orderId: data.order_id,
        keyId: data.key_id,
      }
    } else {
      const err = await backendRes.json().catch(() => ({ detail: "Could not initiate donation." }))
      return { error: err.detail || "Could not initiate donation.", status: backendRes.status }
    }
  } catch (err) {
    console.warn("FastAPI backend unavailable, falling back to direct Razorpay integration.", err)
  }

  // 2. Direct Razorpay Order Creation fallback
  if (isRazorpayConfigured()) {
    try {
      const dummyId = `dn_${Date.now()}`
      const order = await createRazorpayOrder({
        donationId: dummyId,
        amountInRupees: input.amount,
        donorEmail: `${input.githubUsername}@users.noreply.github.com`,
      })

      return {
        mode: "razorpay",
        donationId: dummyId,
        orderId: order.id,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      }
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Razorpay order creation failed.", status: 502 }
    }
  }

  // 3. Demo fallback if backend is unreachable and no Razorpay configured
  return { error: "Payment service is unavailable. Please try again later.", status: 503 }
}
