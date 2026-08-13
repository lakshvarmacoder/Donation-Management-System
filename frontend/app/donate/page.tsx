"use client"

import type { FormEvent, ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Heart, LockKeyhole, Loader2, ArrowLeft, Users } from "lucide-react"

import { startDonation } from "@/lib/donations/client"
import { verifyPayment } from "@/lib/api-client"
import { loadRazorpayCheckout } from "@/lib/payments/razorpay-client"
import { Button } from "@/components/ui/button"

const SUGGESTED_AMOUNTS = [10, 50, 100, 500]
const DEFAULT_AMOUNT = String(SUGGESTED_AMOUNTS[0])

export default function DonatePage() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [alreadyOnWall, setAlreadyOnWall] = useState<string | null>(null) // stores the github username

  async function submitDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    setAlreadyOnWall(null)

    const form = new FormData(event.currentTarget)
    const githubUsername = String(form.get("githubUsername") ?? "").trim().replace(/^@/, "")

    const donation = {
      campaignSlug: "donor-wall",
      githubUsername,
      amount: Number(amount),
    }

    try {
      const checkout = await startDonation(donation)

      if (checkout.mode === "demo") {
        const demoOrderId: string = typeof (checkout as any).orderId === "string" ? (checkout as any).orderId : ""
        await verifyPayment({
          razorpay_order_id: demoOrderId,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: "",
        })
        setMessage(
          "Thank you! Your test donation has been recorded. You are now featured on the live donor wall!"
        )
        return
      }

      await openRazorpayCheckout(checkout, donation, "Support this project")
      setMessage(
        "Payment verified! You are now featured on the live donor wall."
      )
    } catch (error) {
      const msg = error instanceof Error ? error.message : "We could not start your donation."
      // Detect the 409 duplicate response from backend
      if (msg.includes("already on the donor wall")) {
        setAlreadyOnWall(githubUsername)
      } else {
        setMessage(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 sm:px-6 py-8 sm:py-16 text-body-public font-sans">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm md:grid-cols-[0.9fr_1.1fr] grid">
        <CampaignSummary />
        <section className="p-6 sm:p-10">
          {alreadyOnWall ? (
            <AlreadyOnWall username={alreadyOnWall} onReset={() => setAlreadyOnWall(null)} />
          ) : message ? (
            <DonationResult message={message} onReset={() => setMessage("")} />
          ) : (
            <DonationForm
              amount={amount}
              isSubmitting={isSubmitting}
              onAmountChange={setAmount}
              onSubmit={submitDonation}
            />
          )}
        </section>
      </div>
    </main>
  )
}

function CampaignSummary() {
  return (
    <section className="flex flex-col justify-between gap-10 bg-primary p-6 sm:p-10 text-primary-foreground font-sans">
      <div className="flex flex-col gap-6">
        <Link className="inline-flex items-center gap-2 font-semibold text-sm hover:opacity-90 transition-opacity" href="/">
          <ArrowLeft className="size-4" /> Back to Live Wall
        </Link>
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary-foreground/75">
            Test Mode Donation
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Support &amp; Join the Wall
          </h1>
          <p className="text-body-public text-sm leading-relaxed text-primary-foreground/85">
            Make a test donation using Razorpay test mode (no real money charged). Enter your GitHub username to fetch your official avatar for the public donor wall.
          </p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 pt-5 text-xs flex flex-col gap-1">
        <p className="font-semibold text-sm flex items-center gap-1.5">
          <Heart className="size-4 fill-current" /> Razorpay Test Mode
        </p>
        <p className="text-primary-foreground/80">Instant live wall updates &amp; GitHub profile avatar</p>
      </div>
    </section>
  )
}

type DonationFormProps = {
  amount: string
  isSubmitting: boolean
  onAmountChange: (amount: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function DonationForm({ amount, isSubmitting, onAmountChange, onSubmit }: DonationFormProps) {
  return (
    <form className="flex flex-col gap-5 font-sans" onSubmit={onSubmit}>
      <div>
        <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Join the donor wall</p>
        <h2 className="font-heading mt-1 text-2xl font-semibold tracking-tight">Choose an amount</h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {SUGGESTED_AMOUNTS.map((value) => {
          const isSelected = amount === String(value)
          return (
            <button
              className={`font-mono tabular-nums h-11 rounded-xl border text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                  : "bg-background hover:bg-muted/60 text-foreground border-border"
              }`}
              key={value}
              onClick={() => onAmountChange(String(value))}
              type="button"
            >
              ₹{value.toLocaleString("en-IN")}
            </button>
          )
        })}
      </div>

      <FormField label="Custom amount (₹)">
        <input
          className={inputClassName + " font-mono tabular-nums text-sm"}
          min="1"
          onChange={(event) => onAmountChange(event.target.value)}
          required
          step="1"
          type="number"
          value={amount}
        />
      </FormField>

      <FormField label="GitHub username (required)">
        <input
          className={inputClassName + " text-sm"}
          name="githubUsername"
          placeholder="e.g. octocat"
          required
        />
      </FormField>

      <Button
        className="h-11 w-full text-sm font-medium gap-2 shadow-2xs mt-1"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Verifying &amp; Preparing Payment...
          </>
        ) : (
          `Make a test payment · ₹${Number(amount || 0).toLocaleString("en-IN")}`
        )}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <LockKeyhole aria-hidden="true" className="size-3.5" /> Razorpay Test Mode · No real money processed.
      </p>
    </form>
  )
}

function AlreadyOnWall({ username, onReset }: { username: string; onReset: () => void }) {
  return (
    <div aria-live="polite" className="flex flex-col gap-5 py-4 font-sans" role="status">
      <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
        <Users aria-hidden="true" className="size-7" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Already on the wall!</h2>
        <p className="text-body-public text-sm leading-relaxed text-muted-foreground">
          <span className="font-mono font-medium text-foreground">@{username}</span> has already donated and is featured on the live wall.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <Link href="/">
          <Button size="sm" className="gap-2">
            View Live Donor Wall <Heart className="size-3.5 fill-current" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

function DonationResult({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div aria-live="polite" className="flex flex-col gap-5 py-4 font-sans" role="status">
      <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
        <CheckCircle2 aria-hidden="true" className="size-7" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Donation Successful!</h2>
        <p className="text-body-public text-sm leading-relaxed text-muted-foreground">{message}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <Link href="/">
          <Button size="sm" className="gap-2">
            View Live Donor Wall <Heart className="size-3.5 fill-current" />
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={onReset}>
          Donate again
        </Button>
      </div>
    </div>
  )
}

function FormField({ children, label }: { children: ReactNode; label: ReactNode }) {
  return <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground font-sans">{label}{children}</label>
}

async function openRazorpayCheckout(
  checkout: Extract<Awaited<ReturnType<typeof startDonation>>, { mode: "razorpay" }>,
  donation: { githubUsername: string; donorName?: string; donorEmail?: string; donorPhone?: string },
  campaignDescription: string
): Promise<void> {
  const isLoaded = await loadRazorpayCheckout()
  if (!isLoaded || !window.Razorpay) {
    throw new Error("Secure checkout could not be loaded. Please try again.")
  }

  const name = donation.donorName || donation.githubUsername || "Donor"
  const prefill: { name: string; email: string } = {
    name,
    email: `${name.replace(/\s+/g, "").toLowerCase()}@users.noreply.github.com`,
  }

  return new Promise((resolve, reject) => {
    try {
      const rzp = new window.Razorpay!({
        key: checkout.keyId,
        order_id: checkout.orderId,
        name: "Lakshvarma",
        description: campaignDescription || "Support this project",
        prefill,
        theme: { color: "#111827" },
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            resolve()
          } catch (err) {
            reject(err)
          }
        },
        modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
      })
      rzp.open()
    } catch (err) {
      reject(err)
    }
  })
}

const inputClassName =
  "h-10 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all font-sans"
