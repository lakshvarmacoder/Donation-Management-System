import type { DonationRequest } from "@/lib/donations/request"

export type DonationCheckout =
  | { mode: "demo"; donationId?: string }
  | { mode: "razorpay"; donationId: string; orderId: string; keyId: string }

type DonationError = { error?: string }

export async function startDonation(input: DonationRequest): Promise<DonationCheckout> {
  const response = await fetch("/api/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const body = (await response.json()) as DonationCheckout & DonationError

  if (!response.ok || "error" in body) {
    throw new Error(body.error ?? "We could not start your donation.")
  }

  return body
}
