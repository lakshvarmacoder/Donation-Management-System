import "server-only"

type RazorpayOrder = {
  id: string
  amount: number
  currency: string
}

type RazorpayOrderInput = {
  donationId: string
  amountInRupees: number
  donorEmail: string
}

export function isRazorpayConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

export async function createRazorpayOrder(input: RazorpayOrderInput) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing.")
  }

  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: input.amountInRupees * 100,
      currency: "INR",
      receipt: input.donationId,
      notes: { donation_id: input.donationId, donor_email: input.donorEmail },
    }),
  })

  if (!response.ok) {
    throw new Error("Razorpay could not create a payment order.")
  }

  return (await response.json()) as RazorpayOrder
}
