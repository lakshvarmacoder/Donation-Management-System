"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { getBackendUrl } from "@/lib/api-client"

export default function IntegrationDemoPage() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...")
  const backendUrl = getBackendUrl()

  useEffect(() => {
    fetch(`${backendUrl}/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(`Connected (${data.app || "FastAPI"})`))
      .catch(() => setBackendStatus(`Offline (${backendUrl})`))
  }, [backendUrl])

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">
              🔌 Donation System Integration Showcase
            </h1>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${backendStatus.includes("Connected") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              Backend API: {backendStatus}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            This page demonstrates how <strong>any third-party website</strong> can integrate the Donation Management System via API or an embeddable widget script.
          </p>
        </div>

        {/* Integration Methods Grid */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Method 1: Live Embeddable Widget */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Method 1: Embeddable JS Widget
            </h2>
            <p className="text-xs text-slate-500">
              Third-party sites paste 1 line of HTML and script to embed an interactive donation box.
            </p>

            {/* The Container target */}
            <div id="donation-widget" data-campaign="school-kits" data-backend={backendUrl}></div>

            {/* Load Widget Script */}
            <Script src="/widget.js" strategy="lazyOnload" />
          </div>

          {/* Method 2: HTML Integration Snippet */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Method 2: Integration HTML Snippet
            </h2>
            <p className="text-xs text-slate-500">
              Copy-paste code for external websites:
            </p>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto space-y-2 border border-slate-800 shadow-inner">
              <span className="text-slate-500">// 1. HTML Container</span>
              <pre className="text-emerald-400">
                {`<div id="donation-widget"
  data-campaign="school-kits"
  data-backend="${backendUrl}">
</div>`}
              </pre>

              <span className="text-slate-500">// 2. Script Embed</span>
              <pre className="text-sky-400">
                {`<script src="https://your-domain.com/widget.js"></script>`}
              </pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 space-y-1">
              <p className="font-semibold">⚡ OpenAPI / Swagger Docs</p>
              <p>Explore full REST API endpoints at <a href={`${backendUrl}/docs`} target="_blank" rel="noreferrer" className="underline font-mono text-blue-700">{backendUrl}/docs</a></p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
