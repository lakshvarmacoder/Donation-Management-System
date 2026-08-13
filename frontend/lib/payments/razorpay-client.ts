export type RazorpayCheckoutOptions = {
  key: string
  order_id: string
  name: string
  description: string
  prefill: { name: string; email: string }
  theme: { color: string }
  handler: (response?: any) => void | Promise<void>
  modal?: { ondismiss: () => void }
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void }
  }
}

const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js"

export function loadRazorpayCheckout(): Promise<boolean> {
  if (window.Razorpay) {
    return Promise.resolve(true)
  }

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_CHECKOUT_URL}"]`)
  if (existingScript) {
    return waitForRazorpayScript(existingScript)
  }

  const script = document.createElement("script")
  script.src = RAZORPAY_CHECKOUT_URL
  document.body.append(script)

  return waitForRazorpayScript(script)
}

function waitForRazorpayScript(script: HTMLScriptElement): Promise<boolean> {
  return new Promise((resolve) => {
    script.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true })
    script.addEventListener("error", () => resolve(false), { once: true })
  })
}
