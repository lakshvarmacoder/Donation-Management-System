import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HomeWallSection } from "@/components/home-wall-section"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* 1. Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            Lakshvarma
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-3 text-sm">
            <ThemeToggle />
            <a
              href="https://github.com/lakshvarmacoder"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="gap-2">
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
                </svg>
                View source
              </Button>
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16 flex flex-col gap-12 sm:gap-16">
          {/* 2. Hero */}
          <section className="flex flex-col items-start gap-5 max-w-3xl">
            <Badge variant="outline" className="px-3 py-1 text-xs font-normal">
              Demo Project · Razorpay Test Mode
            </Badge>

            <h1 className="text-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
              Donation Management System
            </h1>

            <p className="text-body-public text-base sm:text-lg text-muted-foreground leading-relaxed">
              A full-stack donation project I built — enter your GitHub username, make a test donation via Razorpay, and your avatar shows up on the live wall below.
            </p>

            <HomeWallSection />

            <Link href="/donate" className="pt-2">
              <Button size="lg" className="gap-2">
                Make a test payment <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </Link>
          </section>

          {/* 3. AboutBuild */}
          <section className="rounded-xl border border-border bg-muted/40 p-6 sm:p-8 flex flex-col gap-5">
            <p className="text-body-public text-sm sm:text-base text-muted-foreground leading-relaxed">
              This is a demo of a donation management system I built — Next.js, FastAPI, and Supabase under the hood, Razorpay handling payments in test mode.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Next.js</Badge>
              <Badge variant="secondary">FastAPI</Badge>
              <Badge variant="secondary">Supabase</Badge>
              <Badge variant="secondary">Razorpay</Badge>
              <Badge variant="secondary">Tailwind</Badge>
            </div>
          </section>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center text-center px-5">
          <p className="text-sm sm:text-base font-medium text-muted-foreground">
            Built by{" "}
            <a
              href="https://lakshvarma.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
            >
              lakshvarma
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
