import { describe, expect, it, vi, beforeEach } from "vitest"
import {
  fetchPlatformStats,
  saveOfflineDonation,
  verifyPayment,
  deleteDonation,
  fetchDonorWall,
} from "./api-client"

describe("api-client service module", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("fetchPlatformStats should return summary metrics", async () => {
    const mockStats = { total_raised: 150000, unique_donors: 42 }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    } as Response)

    const stats = await fetchPlatformStats()
    expect(stats).toEqual(mockStats)
  })

  it("saveOfflineDonation should POST data to /api/v1/donations/offline", async () => {
    const mockDonation = {
      id: "dn-1",
      donor_name: "John Doe",
      donor_email: "john@example.com",
      amount: 1000,
      source: "offline",
      status: "completed",
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonation),
    } as Response)

    const result = await saveOfflineDonation({
      donor_name: "John Doe",
      donor_email: "john@example.com",
      amount: 1000,
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/donations/offline"),
      expect.objectContaining({ method: "POST" })
    )
    expect(result).toEqual(mockDonation)
  })

  it("verifyPayment should POST to /api/v1/donations/verify", async () => {
    const mockDonation = { id: "dn-1", status: "completed" }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDonation),
    } as Response)

    const result = await verifyPayment({
      razorpay_order_id: "order_demo_abc",
      razorpay_payment_id: "pay_demo_123",
      razorpay_signature: "",
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/donations/verify"),
      expect.objectContaining({ method: "POST" })
    )
    expect(result).toEqual(mockDonation)
  })

  it("deleteDonation should send DELETE to /api/v1/donations/{id}", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    } as Response)

    await deleteDonation("dn-1")

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/donations/dn-1"),
      expect.objectContaining({ method: "DELETE" })
    )
  })

  it("fetchDonorWall should GET /api/v1/donations/wall", async () => {
    const mockWall = [
      { id: "wall-1", donor_name: "Alice", amount: 10, avatar_url: null, github_username: "alice", created_at: "2026-08-12" },
    ]

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWall),
    } as Response)

    const wall = await fetchDonorWall()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/donations/wall"),
      expect.anything()
    )
    expect(wall).toEqual(mockWall)
  })
})
