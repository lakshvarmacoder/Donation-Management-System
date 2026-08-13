# Typography Guidelines

This file is the single source of truth for typography decisions in this project.
It is written for both human developers and AI agents — every rule has a rationale,
every implementation detail is explicit.

---

## 1. Fonts in use

| Role | Family | Type |
|---|---|---|
| All headings and body text | Google Sans Flex Variable | Variable font (6 axes) |
| All monospace / numeric data | Google Sans Code Variable | Variable font |

### Why these two

Google Sans Flex is a single variable font file that covers the full display-to-body
range via its optical size axis (`opsz`). You do not need separate "display" and "text"
families — the font adjusts its letterforms automatically at each size. Google Sans Code
is designed specifically for code and tabular data, with clear disambiguation of
characters like `1/I` and `0/O`.

---

## 2. Installing the fonts

Google Sans Flex and Google Sans Code are not yet in `next/font/google`'s bundled list.
Use **Fontsource** — it packages them as versioned npm packages you self-host.

```bash
npm install @fontsource-variable/google-sans-flex @fontsource-variable/google-sans-code
```

Import in `app/layout.tsx` above `globals.css`:

```tsx
// app/layout.tsx
import "@fontsource-variable/google-sans-flex"
import "@fontsource-variable/google-sans-code"
import "./globals.css"
```

Wire up as CSS variables in `globals.css`:

```css
@theme inline {
  --font-sans: 'Google Sans Flex Variable', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Google Sans Code Variable', ui-monospace, monospace;
}
```

### Fallback: next/font/local

If the Fontsource install fails (restricted network, CI environment), download the
`.woff2` files from fonts.google.com and use `next/font/local`:

```tsx
import localFont from "next/font/local"

const googleSansFlex = localFont({
  src: "./fonts/GoogleSansFlex[opsz,slnt,wdth,wght,GRAD,ROND].woff2",
  variable: "--font-sans",
})
const googleSansCode = localFont({
  src: "./fonts/GoogleSansCode[wght].woff2",
  variable: "--font-mono",
})
```

Do not substitute a different typeface without asking. If the install fails, stop and
report the error.

---

## 3. Variable font axes

Google Sans Flex has six registered axes:

| Axis tag | Name | Range | Default | Notes |
|---|---|---|---|---|
| `wght` | Weight | 1–1000 | 400 | Maps to `font-weight` |
| `wdth` | Width | 25–151 | 100 | Rarely needed — leave at default |
| `opsz` | Optical size | 6–144 | 14 | **Set this to match the rendered px size** |
| `slnt` | Slant | -10–0 | 0 | Italic substitute — leave at default |
| `GRAD` | Grade | 0–100 | 0 | Dark mode compensation (see section 6) |
| `ROND` | Roundness | 0–100 | 0 | Surface personality (see section 5) |

Google Sans Code has two axes: `wght` (300–800) and `MONO` (0–1, leave at default 1).

### The critical cascade rule

`font-variation-settings` does **not** cascade additively. Every axis not explicitly
listed in a rule reverts to its default. If one class sets `slnt` and another sets
`GRAD`, applying the second wipes out the first unless every axis is repeated in full.

**This is the #1 way variable font implementations silently break.**

Rule: never split axes across classes that might combine. Define complete axis sets
in named utility classes only (see section 4).

---

## 4. Named utility classes — the only way to set axes

Never write `font-variation-settings` inline in a component. Use only these utility
classes, defined once in `globals.css`. Each class lists every axis in full.

```css
@layer utilities {
  /* Public donor-facing surface — warmer, rounder */
  .text-display {
    font-variation-settings: "opsz" 60, "wght" 550, "GRAD" 0, "ROND" 25;
  }
  .text-heading {
    font-variation-settings: "opsz" 30, "wght" 500, "GRAD" 0, "ROND" 20;
  }
  .text-body-public {
    font-variation-settings: "opsz" 16, "wght" 400, "GRAD" 0, "ROND" 25;
  }

  /* Admin dashboard surface — sharp, precise */
  .text-heading-dash {
    font-variation-settings: "opsz" 30, "wght" 500, "GRAD" 0, "ROND" 0;
  }
  .text-body-dash {
    font-variation-settings: "opsz" 14, "wght" 400, "GRAD" 0, "ROND" 0;
  }
}
```

If a component needs a combination not listed here, stop and add a new named class
to this file. Do not invent one-off inline values.

---

## 5. Two surfaces, two personalities

Roundness (`ROND`) is the axis that separates the two surfaces of this product.

| Surface | Pages | ROND | Character |
|---|---|---|---|
| Public / donor-facing | `/`, `/donate` | 20–30 | Warm, approachable, humanist |
| Admin / dashboard | `/dms` | 0 | Sharp, precise, professional |

Rules:
- Never apply `ROND > 0` inside the admin dashboard
- Never apply `ROND 0` on donor-facing pages
- The Tailwind size classes and weights are the same on both surfaces — only `ROND`
  and `opsz` differ

---

## 6. Dark mode — use GRAD, not a different weight

When switching to dark mode, do not increase `font-weight` to compensate for
perceived thinning. Use the `GRAD` axis instead — it adjusts stroke contrast
without changing the font's metrics, so layout does not shift.

```css
@media (prefers-color-scheme: dark) {
  .text-body-public  { font-variation-settings: "opsz" 16, "wght" 400, "GRAD" 20, "ROND" 25; }
  .text-body-dash    { font-variation-settings: "opsz" 14, "wght" 400, "GRAD" 20, "ROND" 0; }
  .text-heading      { font-variation-settings: "opsz" 30, "wght" 500, "GRAD" 15, "ROND" 20; }
  .text-heading-dash { font-variation-settings: "opsz" 30, "wght" 500, "GRAD" 15, "ROND" 0; }
  .text-display      { font-variation-settings: "opsz" 60, "wght" 550, "GRAD" 10, "ROND" 25; }
}
```

Note every axis is repeated in full — this is required (see section 3).

---

## 7. Type scale

Two bases for two surfaces. Both map to Tailwind's default scale — no custom values needed.

**Dashboard base: 14px** — dense, internal, trained users. Major Second ratio (×1.125).

**Public pages base: 16px** — general public, trust-critical. Never use smaller than
`text-base` for paragraph copy on donor-facing pages.

| Role | Surface | Tailwind class | Utility class | Weight | Line-height |
|---|---|---|---|---|---|
| Hero headline | Public | `text-5xl md:text-6xl` | `.text-display` | 550 | `leading-tight` |
| Page / campaign title | Both | `text-3xl` | `.text-heading` / `.text-heading-dash` | 500 | `leading-tight` |
| Section header | Both | `text-xl` | `.text-heading` / `.text-heading-dash` | 500 | `leading-snug` |
| Stat figure (₹ amounts) | Dashboard | `text-3xl font-mono tabular-nums` | — | 500 | `leading-none` |
| Body paragraph | Public | `text-base` | `.text-body-public` | 400 | `leading-relaxed` |
| UI text, form labels | Dashboard | `text-sm` | `.text-body-dash` | 400–500 | `leading-normal` |
| Table cell (text) | Dashboard | `text-sm` | `.text-body-dash` | 400 | `leading-normal` |
| Table cell (amount) | Dashboard | `text-sm font-mono tabular-nums` | — | 400 | `leading-normal` |
| Caption / meta / timestamp | Both | `text-xs text-muted-foreground` | — | 400 | `leading-normal` |
| Table header / eyebrow label | Dashboard | `text-xs uppercase tracking-wide` | — | 500 | — |
| Code / inline code | Both | `font-mono` | — | 400 | `leading-normal` |

---

## 8. Monospace and numeric data

Any currency figure, numeric stat, or table amount column must use:

```
font-mono tabular-nums
```

This applies Google Sans Code and enables tabular (fixed-width) numerals so rupee
figures stay column-aligned regardless of digit count. No exceptions.

Examples: stat cards (`₹2,15,300`), donation table amount column, campaign progress
figures.

---

## 9. Line-height rules

| Context | Tailwind class | Ratio | Reason |
|---|---|---|---|
| Public body paragraphs | `leading-relaxed` | 1.625 | WCAG 1.4.12 requires ≥1.5× for body text |
| Dashboard UI text, table cells | `leading-normal` | 1.5 | Minimum WCAG-compliant for UI text |
| Headings (all) | `leading-tight` or `leading-snug` | 1.25–1.375 | Headings are short; tight leading looks intentional |

Never override line-height with an arbitrary value (`leading-[1.7]`). If none of the
above fits, add a named case here first.

---

## 10. Weight rules

- Body text: 400 (regular)
- UI labels, table headers, section headers: 500 (medium)
- Page titles, hero headlines: 500–600 (medium to semibold)
- Bold (700+): reserved for emphasis within body copy only — not for headings
- Never use 800 or 900 in this product

---

## 11. Generic best practices (source-agnostic)

These apply regardless of which font family is in use.

### Hierarchy

Every page has exactly one `h1`. Section headers are `h2`. Sub-sections are `h3`.
Never skip levels for visual effect — use the type scale instead.

### Measure (line length)

Body text: 60–75 characters per line (`max-w-prose` in Tailwind = 65ch).
Dashboard UI text: 45–75 characters. Never let a paragraph span the full viewport width.

### Contrast

Body text on white: minimum 4.5:1 (WCAG AA). Large text (≥18px regular or ≥14px bold):
minimum 3:1. Use `text-muted-foreground` only for captions and secondary labels, never
for primary content.

### Spacing

Paragraph spacing: at least 1.5× the font size (`mb-4` or `mb-6` at `text-base`).
Never use `<br>` to create paragraph spacing — use margin.

### Avoid

- Justified text (`text-justify`) — creates uneven word spacing in narrow columns
- All-caps for body text — use `uppercase tracking-wide` only for labels and eyebrows
- More than two font families on a single page
- Arbitrary font sizes (`text-[15px]`) — use the scale in section 7 only
- Mixing `font-variation-settings` inline with utility classes on the same element

---

## 12. Verification checklist

After implementing typography on any new page or component, confirm:

```
[ ] Google Sans Flex Variable loads (check Network tab — one .woff2 file)
[ ] Google Sans Code Variable loads (check Network tab — one .woff2 file)
[ ] Inspect a heading in devtools → Font Variations panel shows all 6 axes
[ ] ROND is 0 on all dashboard elements, 20–30 on all public elements
[ ] No font-variation-settings written inline in any component
[ ] All currency/numeric values use font-mono + tabular-nums
[ ] Body paragraphs on public pages use leading-relaxed
[ ] No text smaller than text-xs anywhere
[ ] No arbitrary text-[Npx] values anywhere
[ ] Contrast ratio ≥ 4.5:1 for all body text (check with browser accessibility tool)
```

---

## 13. AI agent prompt — copy-paste ready

Use this prompt when asking an AI agent to implement or audit typography:

```
Implement typography for this Next.js + Tailwind v4 + shadcn project using
Google Sans Flex Variable (headings + body) and Google Sans Code Variable
(monospace + tabular data). Follow design/typography-guidelines.md exactly.

1. INSTALL: Use Fontsource — not next/font/google (these fonts aren't in its list yet):
     npm install @fontsource-variable/google-sans-flex @fontsource-variable/google-sans-code
   Import both in app/layout.tsx above globals.css. Reference in globals.css as
   --font-sans: 'Google Sans Flex Variable' and --font-mono: 'Google Sans Code Variable'.
   If the install fails, stop and report — do not substitute a different typeface.

2. AXES: Never write font-variation-settings inline in a component. Use only the five
   named utility classes defined in globals.css: .text-display, .text-heading,
   .text-heading-dash, .text-body-public, .text-body-dash. Each class must list every
   axis in full — font-variation-settings does not cascade additively, so splitting
   axes across classes silently breaks the font.

3. SCALE: Use Tailwind's default text-* classes only, never arbitrary values (no text-[15px]):
   - Dashboard base 14px (text-sm): labels/table cells text-sm, section headers text-xl,
     page titles text-3xl.
   - Public pages base 16px (text-base): body text-base (never smaller for paragraphs),
     section headers text-xl, hero text-5xl md:text-6xl.
   - Captions, timestamps, table header labels: text-xs text-muted-foreground only.

4. NUMBERS: Every currency figure, numeric stat, or table amount column gets
   font-mono + tabular-nums. No exceptions.

5. LINE-HEIGHT: leading-relaxed on public body paragraphs, leading-normal on dashboard
   UI text and table cells, leading-tight or leading-snug on headings only.
   Never use an arbitrary leading value.

6. ROUNDNESS: ROND 0 on every dashboard utility class, ROND 20–30 on every public-facing
   utility class. Do not apply ROND > 0 inside /dms. Do not apply ROND 0 on /donate or /.

7. DARK MODE: Use the GRAD axis (not font-weight) to compensate for perceived thinning
   in dark mode. Repeat every axis in full in the dark-mode override.

8. FLAG DON'T FIX: If a component needs a size, weight, or axis combination not in
   design/typography-guidelines.md, stop and ask rather than inventing a new value.
```
