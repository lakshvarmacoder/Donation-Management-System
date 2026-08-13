# Codebase Audit Report
> Stack: Next.js 16.3.0 · React 19.2.8 · FastAPI · Supabase
> References: Clean Code (Robert C. Martin) + Next.js 15/16 best practices

---

## 1. Clean Code Violations

---

### 1.1 Functions That Do More Than One Thing (Ch. 3 — SRP)

**`frontend/app/donate/page.tsx` — `submitDonation()`**
This function does 5 things: reads form data, validates, calls the API, handles the demo path, opens Razorpay, and sets UI state. It should be split into smaller focused functions.

**`frontend/components/admin/admin-dashboard.tsx` — `exportDonationsCSV()`**
Builds CSV content, creates a Blob, creates a URL, creates a DOM element, clicks it, and removes it — all in one function. The DOM manipulation should be extracted.

**`backend/app/api/v1/donations.py` — `_verify_and_fetch_github_user()`**
Does validation, regex check, HTTP call, and response parsing. Each is a separate concern.

---

### 1.2 Flag Arguments (Ch. 3 — Avoid Boolean/Flag Args)

**`frontend/components/admin/donation-table.tsx`**
`isLoading?: boolean` passed into `DonationTable` causes the component to render two completely different UIs (skeleton vs real table). This is a flag argument anti-pattern. The loading skeleton should be a separate component (`DonationTableSkeleton`) rendered by the parent.

**`frontend/components/admin/admin-dashboard.tsx`**
`isLoading` is threaded through `OverviewTab` and `DonationsTab` purely to pass down to `DonationTable`. Same issue.

---

### 1.3 Magic Numbers / Strings (Ch. 17 — G25)

**`frontend/app/donate/page.tsx`**
```ts
const SUGGESTED_AMOUNTS = [10, 50, 100, 500]  // ✅ good
const DEFAULT_AMOUNT = "10"                     // ❌ "10" is a magic string — should be derived from SUGGESTED_AMOUNTS[0]
```

**`frontend/components/donor-wall.tsx`**
```ts
Array.from({ length: 48 })   // magic number — no named constant
```

**`frontend/components/admin/donation-table.tsx`**
```ts
Array.from({ length: 5 })    // magic number — no named constant
```

**`backend/app/api/v1/donations.py`**
```python
.limit(500)   # magic number — should be a named constant WALL_DONOR_LIMIT
receipt=str(donation.id)[:8]  # magic number 8 — should be RECEIPT_ID_LENGTH
```

---

### 1.4 Inconsistent Naming (Ch. 2 — Meaningful Names)

**`frontend/lib/api-client.ts` vs `frontend/lib/donations/service.ts`**
Both define `resolveBackendUrl()` with identical logic but different env var names (`NEXT_PUBLIC_BACKEND_URL` vs `BACKEND_URL`). This is duplication (DRY violation, Ch. 12) AND inconsistent naming. Should be a shared utility.

**`frontend/components/donor-avatar.tsx`**
Props use `snake_case` (`donor_name`, `avatar_url`, `github_username`) while the rest of the TypeScript codebase uses `camelCase`. This is inconsistent with the language convention.

**`backend/app/services/receipt.py`**
`generate_receipt_content()` is marked `async` but has no `await` inside — misleading signature.

---

### 1.5 Dead / Unreachable Code (Ch. 17 — G9)

**`frontend/app/demo/page.tsx`**
Entire page is a dev-only integration demo with hardcoded `localhost:8000` references. Not linked from anywhere in the app. Should either be removed or gated behind `process.env.NODE_ENV === 'development'`.

**`backend/app/services/receipt.py` — `send_receipt_email()`**
Does nothing except `print()` and return `True`. It's a stub that's never called from anywhere in the codebase. Dead code.

**`backend/requirements.txt`**
`firebase-admin>=6.5.0` is listed as a dependency but Firebase Admin is never imported or used anywhere in the backend code. Unused dependency.

**`frontend/package.json`**
`axios` is listed as a dependency (`^1.19.0`) but the codebase uses native `fetch` everywhere. Unused dependency.

**`frontend/package.json`**
`firebase` (`^12.17.1`) is listed but never imported in any frontend file.

---

### 1.6 Comments That Lie / Noise Comments (Ch. 4)

**`backend/app/api/v1/webhooks.py`**
```python
# Update donation status to COMPLETED (triggers SQL receipt creation in Postgres)
```
There is no SQL receipt trigger in the schema. The comment describes behaviour that doesn't exist.

**`backend/app/main.py`**
```python
# Shutdown: Clean up DB pool
```
This comment is inside the lifespan context manager but there's no startup logic — the comment implies symmetry that isn't there.

---

### 1.7 Error Handling — Swallowing Errors (Ch. 7)

**`frontend/components/admin/admin-dashboard.tsx` — `handleDeleteDonation()`**
```ts
} catch (err) {
  console.error("Failed to delete donation:", err)
}
```
Error is logged but the user sees nothing. No toast, no error state, no feedback.

**`frontend/app/donate/page.tsx` — `openRazorpayCheckout()`**
The `handler` callback uses `async` but Razorpay's SDK doesn't await it — unhandled promise rejections inside the handler are silently swallowed.

**`backend/app/api/v1/donations.py` — `_create_razorpay_order()`**
```python
except Exception as e:
    detail=f"Could not prepare payment order: {str(e)}"
```
Leaks internal exception messages to the client. Should log internally and return a generic message.

---

### 1.8 Law of Demeter / Train Wrecks (Ch. 6 — G36)

**`backend/app/services/receipt.py`**
```python
donation.receipt.receipt_number if donation.receipt else 'N/A'
```
Accesses two levels deep into a related object. The receipt number should be passed as a parameter, not navigated to.

---

### 1.9 Overly Large Components (Ch. 3 & 10 — SRP)

**`frontend/app/donate/page.tsx`** — 280+ lines in a single file containing: page shell, campaign summary, donation form, result states, Razorpay integration, and a utility function. Should be split into focused components/modules.

**`frontend/components/admin/admin-dashboard.tsx`** — Contains `exportDonationsCSV`, `OverviewTab`, `DonationsTab`, and `AdminDashboard` all in one file. Each sub-component is large enough to warrant its own file.

---

### 1.10 `any` Type Usage (TypeScript — type safety)

**`frontend/app/donate/page.tsx`**
```ts
const demoOrderId: string = typeof (checkout as any).orderId === "string" ? ...
handler: async (response: any) => {
```
Two uses of `any`. The Razorpay response should have a typed interface. The `checkout as any` cast indicates a type design issue — the discriminated union isn't being used correctly.

---

## 2. Next.js Modernisation

> You are on Next.js 16.3.0 + React 19.2.8 — the latest. These are patterns from older Next.js versions still present in the code.

---

### 2.1 `"use client"` on the Landing Page (Unnecessary Client Bundle)

**`frontend/app/page.tsx`**
The entire landing page is marked `"use client"` just to hold `stats` state from `DonorWall`. In Next.js 15+, you can keep the page as a Server Component and push the `"use client"` boundary down to only `DonorWall` (which already has it). The stats counter can be lifted into a separate `StatsCounter` client component.

**Impact:** The hero, nav, footer, and about section are all static — they're being unnecessarily shipped as client JS.

---

### 2.2 `useEffect` + `fetch` Instead of Server Components / `use()` Hook

**`frontend/components/donor-wall.tsx`**
Uses `useEffect` + `useState` to fetch donor wall data on the client. In Next.js 15+, this can be a Server Component that fetches directly, with a `<Suspense>` boundary for the loading state — eliminating the loading skeleton boilerplate entirely.

**`frontend/components/admin/admin-dashboard.tsx`**
Same pattern — `useEffect` + `Promise.all` to fetch on mount. With React 19's `use()` hook and Server Components, this data can be fetched server-side and streamed.

---

### 2.3 `next/image` Not Used for Avatar Images

**`frontend/components/donor-avatar.tsx`**
Uses a plain `<img>` tag for donor avatars fetched from GitHub. Next.js `<Image>` provides automatic WebP conversion, lazy loading, size optimisation, and prevents CLS. GitHub avatar URLs are external — just add `github.com` and `ui-avatars.com` to `next.config.ts` `images.remotePatterns`.

---

### 2.4 Empty `next.config.ts`

**`frontend/next.config.ts`**
Completely empty. Missing:
- `images.remotePatterns` for GitHub avatars and ui-avatars.com
- `experimental.typedRoutes: true` — compile-time route safety (available since Next.js 13.2)
- Security headers via `headers()` (X-Frame-Options, CSP, etc.)

---

### 2.5 `<Suspense>` Wrapper Is Unnecessary in Next.js 15+

**`frontend/app/donate/page.tsx`**
```tsx
export default function DonatePage() {
  return <Suspense fallback={...}><DonateContent /></Suspense>
}
```
In Next.js 15, wrapping a client component in `<Suspense>` at the page level is only needed if you're using `useSearchParams()`. `DonateContent` doesn't use it — the `<Suspense>` wrapper is cargo-culted and adds no value here.

---

### 2.6 `cookies()` Pattern Is Correct but `secure` Flag Missing

**`frontend/app/dms/login/actions.ts`**
The httpOnly cookie is set without `secure: true`. In production (HTTPS), the cookie should have `secure: true` to prevent transmission over HTTP.

```ts
// Should be:
secure: process.env.NODE_ENV === "production",
```

---

### 2.7 Pydantic v1 `class Config` in Schemas (Backend)

**`backend/app/schemas/donation.py`**
```python
class Config:
    from_attributes = True
```
This is the Pydantic v1 style. You're on Pydantic v2 (`pydantic>=2.10.0`). The modern equivalent is:
```python
model_config = ConfigDict(from_attributes=True)
```
Same issue in `backend/app/core/config.py` — `class Config` inside `Settings`.

---

### 2.8 `datetime.utcnow()` Is Deprecated (Python 3.12+)

**`backend/app/models/__init__.py`**
```python
default=datetime.utcnow
```
`datetime.utcnow()` is deprecated since Python 3.12. Use `datetime.now(timezone.utc)` instead.

---

### 2.9 `declarative_base()` Is Deprecated (SQLAlchemy 2.0)

**`backend/app/models/__init__.py`**
```python
Base = declarative_base()
```
`declarative_base()` is the SQLAlchemy 1.x API. SQLAlchemy 2.0 (which you're on: `sqlalchemy>=2.0.36`) uses:
```python
from sqlalchemy.orm import DeclarativeBase
class Base(DeclarativeBase): pass
```

---

### 2.10 `cors_origins: List[str] = ["*"]` in Production Config

**`backend/app/core/config.py`**
Wildcard CORS is fine for local dev but this is the default that will ship to production unless overridden. Should default to `[]` and require explicit configuration.

---

## Summary Table

| # | File | Issue | Category |
|---|------|-------|----------|
| 1.1 | `donate/page.tsx` | `submitDonation` does 5 things | SRP |
| 1.2 | `donation-table.tsx` | `isLoading` flag argument | Flag Args |
| 1.3 | Multiple | Magic numbers (48, 5, 500, 8) | G25 |
| 1.4 | `api-client.ts` + `service.ts` | Duplicated `resolveBackendUrl` | DRY |
| 1.4 | `donor-avatar.tsx` | `snake_case` props in TS | Naming |
| 1.5 | `demo/page.tsx` | Dead page, never linked | Dead Code |
| 1.5 | `receipt.py` | `send_receipt_email` stub never called | Dead Code |
| 1.5 | `requirements.txt` | `firebase-admin` unused | Dead Code |
| 1.5 | `package.json` | `axios`, `firebase` unused | Dead Code |
| 1.6 | `webhooks.py` | Comment describes non-existent trigger | Lying Comment |
| 1.7 | `admin-dashboard.tsx` | Delete error swallowed, no user feedback | Error Handling |
| 1.7 | `donations.py` | Internal exception message leaked to client | Error Handling |
| 1.8 | `receipt.py` | `donation.receipt.receipt_number` train wreck | Law of Demeter |
| 1.9 | `donate/page.tsx` | 280+ line file, multiple responsibilities | Large Component |
| 1.10 | `donate/page.tsx` | `response: any`, `checkout as any` | Type Safety |
| 2.1 | `app/page.tsx` | Entire page is client, should be server | Next.js |
| 2.2 | `donor-wall.tsx` | `useEffect` fetch, should be Server Component | Next.js |
| 2.3 | `donor-avatar.tsx` | `<img>` instead of `next/image` | Next.js |
| 2.4 | `next.config.ts` | Empty — missing remotePatterns, headers, typedRoutes | Next.js |
| 2.5 | `donate/page.tsx` | Unnecessary `<Suspense>` wrapper | Next.js |
| 2.6 | `actions.ts` | Cookie missing `secure: true` in production | Security |
| 2.7 | `schemas/donation.py` | Pydantic v1 `class Config` style | Pydantic v2 |
| 2.8 | `models/__init__.py` | `datetime.utcnow()` deprecated in Python 3.12 | Python |
| 2.9 | `models/__init__.py` | `declarative_base()` deprecated in SQLAlchemy 2.0 | SQLAlchemy |
| 2.10 | `config.py` | `cors_origins = ["*"]` default | Security |
