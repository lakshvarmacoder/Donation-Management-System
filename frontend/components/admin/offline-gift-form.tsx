"use client"

import { useState } from "react"
import { HandCoins, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { saveOfflineDonation } from "@/lib/api-client"

type OfflineGiftFormProps = {
  onSuccess?: () => void
}

export function OfflineGiftForm({ onSuccess }: OfflineGiftFormProps) {
  const [donorName, setDonorName] = useState("")
  const [githubUsername, setGithubUsername] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!donorName || !amount) return

    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      await saveOfflineDonation({
        donor_name: donorName,
        donor_email: githubUsername
          ? `${githubUsername.trim().replace(/^@/, "")}@users.noreply.github.com`
          : `${donorName.trim().replace(/\s+/g, "").toLowerCase()}@users.noreply.github.com`,
        amount: Number(amount),
      })
      setStatusMessage("Offline donation recorded successfully!")
      setDonorName("")
      setGithubUsername("")
      setAmount("")
      if (onSuccess) onSuccess()
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Could not save offline donation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4 pt-5 md:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium">
            Donor Name
            <Input
              required
              placeholder="Full name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium">
            GitHub Username (optional)
            <Input
              placeholder="e.g. octocat"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium">
            Amount (₹)
            <Input
              required
              type="number"
              min="1"
              placeholder="₹ 0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <div className="flex flex-col justify-end gap-1">
            <Button className="w-full" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <HandCoins className="size-3.5" />
              )}
              {isSubmitting ? "Saving..." : "Save offline gift"}
            </Button>
          </div>
        </CardContent>
        {statusMessage && (
          <p className="px-6 pb-4 text-xs font-medium text-emerald-600">{statusMessage}</p>
        )}
      </form>
    </Card>
  )
}
