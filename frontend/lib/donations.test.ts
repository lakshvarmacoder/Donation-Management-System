import { describe, expect, it } from "vitest"
import { formatCurrency } from "./donations"

describe("formatCurrency", () => {
  it("should format currency amount in INR by default", () => {
    const formatted = formatCurrency(2500)
    expect(formatted.replace(/\s/g, " ")).toContain("2,500")
  })

  it("should handle 0 amount correctly", () => {
    const formatted = formatCurrency(0)
    expect(formatted.replace(/\s/g, " ")).toContain("0")
  })
})
