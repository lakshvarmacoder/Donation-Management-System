import { NextResponse } from "next/server"

import { validateDonationRequest } from "@/lib/donations/request"
import { prepareDonation } from "@/lib/donations/service"

export async function POST(request: Request) {
  const body = await readJsonBody(request)
  if (!body.success) {
    return NextResponse.json({ error: body.error }, { status: 400 })
  }

  const validation = validateDonationRequest(body.data)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const result = await prepareDonation(validation.data)
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json(result)
}

async function readJsonBody(request: Request): Promise<{ success: true; data: unknown } | { success: false; error: string }> {
  try {
    return { success: true, data: await request.json() }
  } catch {
    return { success: false, error: "Request body must be valid JSON." }
  }
}
