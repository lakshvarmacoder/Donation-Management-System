export type DonationRequest = {
  githubUsername: string
  donorName?: string
  amount: number
}

type DonationRequestValidation =
  | { success: true; data: DonationRequest }
  | { success: false; error: string }

const GITHUB_USER_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/^@/, "") : ""
}

/**
 * Keeps the browser and API boundary explicit. Amounts are whole rupees until
 * the payment provider converts them to its smallest currency unit.
 */
export function validateDonationRequest(value: unknown): DonationRequestValidation {
  if (!isRecord(value)) {
    return { success: false, error: "Please provide donation details." }
  }

  const githubUsername = getTrimmedString(value.githubUsername)
  const donorName = getTrimmedString(value.donorName)
  const amount = typeof value.amount === "number" ? value.amount : Number(value.amount)

  if (!githubUsername) {
    return { success: false, error: "GitHub username is required to show your avatar on the wall." }
  }

  if (!GITHUB_USER_PATTERN.test(githubUsername)) {
    return { success: false, error: "Please enter a valid GitHub username (e.g. octocat)." }
  }

  if (!Number.isSafeInteger(amount) || amount < 1) {
    return { success: false, error: "Please enter a whole donation amount of at least ₹1." }
  }

  return {
    success: true,
    data: {
      githubUsername,
      donorName: donorName || githubUsername,
      amount,
    },
  }
}
