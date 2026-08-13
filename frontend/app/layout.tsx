import type { Metadata } from "next";
import "@fontsource-variable/google-sans-flex";
import "@fontsource-variable/google-sans-code";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lakshvarma.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Donation Management System | Live Supporter Wall & Payments",
    template: "%s | Donation Management System",
  },
  description:
    "A full-stack donation management system built by Laksh Varma. Features real-time donor wall, instant Razorpay test mode payment verification, and automated supporter receipts.",
  authors: [{ name: "Laksh Varma", url: "https://lakshvarma.vercel.app" }],
  creator: "Laksh Varma",
  keywords: [
    "Donation Management System",
    "Laksh Varma",
    "Next.js 16",
    "FastAPI",
    "Razorpay",
    "Supabase",
    "Donor Wall",
    "Full Stack Project",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Donation Management System | Live Supporter Wall & Payments",
    description:
      "A full-stack donation platform built by Laksh Varma — enter your GitHub username, make a test donation via Razorpay, and view your avatar on the live donor wall.",
    url: siteUrl,
    siteName: "Donation Management System",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donation Management System | Laksh Varma",
    description:
      "A full-stack donation platform built by Laksh Varma with Next.js, FastAPI, Supabase, and Razorpay.",
    creator: "@lakshvarma",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Donation Management System",
  url: siteUrl,
  description:
    "A full-stack donation management system featuring a real-time donor wall, instant Razorpay test mode payment verification, and automated supporter receipts.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  author: {
    "@type": "Person",
    name: "Laksh Varma",
    url: "https://lakshvarma.vercel.app",
    sameAs: [
      "https://github.com/lakshvarmacoder",
      "https://in.linkedin.com/in/laksh-varma-8b1642391",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delay={50}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
