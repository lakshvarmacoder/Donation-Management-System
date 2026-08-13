import { createHmac, timingSafeEqual } from "crypto"

import { createSupabaseAdminClient, hasSupabaseServerConfiguration } from "@/lib/supabase/admin"

type PaymentStatus = "completed" | "failed"

type RazorpayWebhook = {
  event?: string
  payload?: {
    payment?: {
      entity?: {
        id?: string
        notes?: { donation_id?: string }
      }
    }
  }
}

export async function POST(request: Request) {
  const payload = await request.text()
  if (!hasValidSignature(payload, request.headers.get("x-razorpay-signature"))) {
    return new Response("Invalid Razorpay signature", { status: 401 })
  }

  const event = parseWebhook(payload)
  if (!event) {
    return new Response("Invalid Razorpay payload", { status: 400 })
  }

  const status = getPaymentStatus(event.event)
  if (!status) {
    return new Response(null, { status: 204 })
  }

  const payment = event.payload?.payment?.entity
  const donationId = payment?.notes?.donation_id
  if (!donationId) {
    return new Response("Donation reference missing", { status: 400 })
  }

  if (!hasSupabaseServerConfiguration()) {
    return new Response("Donation storage is not configured", { status: 503 })
  }

  const { error } = await createSupabaseAdminClient()
    .from("donations")
    .update({ status, gateway_payment_id: payment.id ?? null })
    .eq("id", donationId)

  return error ? new Response("Could not update donation", { status: 500 }) : new Response(null, { status: 204 })
}

function hasValidSignature(payload: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) {
    return false
  }

  const expected = Buffer.from(createHmac("sha256", secret).update(payload).digest("hex"))
  const received = Buffer.from(signature)

  return expected.length === received.length && timingSafeEqual(expected, received)
}

function parseWebhook(payload: string): RazorpayWebhook | null {
  try {
    const parsed: unknown = JSON.parse(payload)
    if (!isPlainObject(parsed)) return null
    return parsed as RazorpayWebhook
  } catch {
    return null
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype
}

function getPaymentStatus(eventName: string | undefined): PaymentStatus | null {
  if (eventName === "payment.captured") {
    return "completed"
  }

  if (eventName === "payment.failed") {
    return "failed"
  }

  return null
}
