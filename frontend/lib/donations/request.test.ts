import { describe, expect, it } from "vitest"
import { validateDonationRequest } from "./request"

describe("validateDonationRequest", () => {
  it("should validate a correct donation request successfully", () => {
    const validInput = {
      githubUsername: "aaravmehta",
      donorName: "Aarav Mehta",
      amount: 1500,
    }

    const result = validateDonationRequest(validInput)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        githubUsername: "aaravmehta",
        donorName: "Aarav Mehta",
        amount: 1500,
      })
    }
  })

  it("should fail validation when payload is not an object", () => {
    const result = validateDonationRequest(null)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Please provide donation details.")
    }
  })

  it("should fail validation when githubUsername is omitted", () => {
    const missingGithubInput = {
      donorName: "Aarav Mehta",
      amount: 100,
    }

    const result = validateDonationRequest(missingGithubInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("GitHub username is required to show your avatar on the wall.")
    }
  })

  it("should default donorName to githubUsername when not provided", () => {
    const input = {
      githubUsername: "aaravmehta",
      amount: 1000,
    }

    const result = validateDonationRequest(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.donorName).toBe("aaravmehta")
    }
  })

  it("should fail validation when amount is less than 1", () => {
    const invalidAmountInput = {
      githubUsername: "aaravmehta",
      donorName: "Aarav Mehta",
      amount: 0,
    }

    const result = validateDonationRequest(invalidAmountInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe("Please enter a whole donation amount of at least ₹1.")
    }
  })

  it("should trim string inputs, capture githubUsername, and convert string numbers to number", () => {
    const untrimmedInput = {
      donorName: "  Aarav Mehta  ",
      githubUsername: "  @aaravmehta  ",
      amount: "500",
    }

    const result = validateDonationRequest(untrimmedInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.donorName).toBe("Aarav Mehta")
      expect(result.data.githubUsername).toBe("aaravmehta")
      expect(result.data.amount).toBe(500)
    }
  })
})
