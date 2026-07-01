# Vesicash Design System

> Extracted from https://vesicash.com — the official Vesicash marketing site.
> Use this as the reference when designing the API documentation to stay aligned with brand identity.

---

## Brand Identity

**Company:** Vesicash
**Product:** Portal by Vesicash
**Positioning:** *"Merchant of Record for Global Businesses"*
**Tagline:** *"One API, Full Coverage"*
**Core Promise:** Africa's unified payment API — handling payments, tax, and compliance so businesses can scale across the continent.
**Tone:** Professional, confident, action-oriented. Infrastructure-grade trust with African market depth.

---

## Color Palette

All colors extracted directly from the production CSS at `vesicash.com`.

### Primary Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Navy Deep** | `#011A27` | Dark section backgrounds, footer background |
| **Navy Primary** | `#043B56` | Primary dark backgrounds, card backgrounds on dark |
| **Ocean Blue** | `#0B618F` | Link color, body text on light backgrounds (accent) |
| **Sky Blue** | `#24ACEE` | Highlight accents, inline text emphasis, interactive highlights |
| **Brand Green** | `#3AB75D` | **Primary CTA buttons**, success states, focus rings, active indicators |

### Neutral / Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Off-White Green** | `#F1F7F6` | Light section backgrounds, alternating row fills |
| **Pale Blue** | `#EEF9FD` | Feature card backgrounds, info block backgrounds |
| **Sage Border** | `#E5EDEB` | Border color for cards, dividers, input fields |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Primary Text** | `#171918` | Main body text, headings |
| **Secondary Text** | `#525857` | Subheadings, descriptive text, meta info |
| **Muted Text** | `#696F6E` | Placeholders, captions, disabled states |
| **White** | `#FFFFFF` | Text on dark backgrounds, button labels on green |

### Color Roles in the API Docs Context

| Role | Color |
|------|-------|
| Background (page) | `#FFFFFF` |
| Background (sidebar) | `#F1F7F6` |
| Background (dark sections / hero) | `#011A27` |
| Background (code blocks) | `#043B56` |
| Background (info callout) | `#EEF9FD` |
| Border / dividers | `#E5EDEB` |
| Primary text | `#171918` |
| Secondary text | `#525857` |
| Link / accent text | `#0B618F` |
| Inline code text | `#24ACEE` |
| Active nav item | `#3AB75D` |
| CTA buttons | `#3AB75D` |
| Success states | `#3AB75D` |
| Focus rings | `#3AB75D` |

---

## Typography

### Font Family

**Primary (UI + Body + Headings):** `Inter`
**Monospace (Code blocks):** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

The site does not use a separate display or serif typeface. Inter handles everything: headings, body, captions, and UI labels.

> For implementation: load Inter from Google Fonts or use the `@fontsource/inter` npm package.

### Type Scale

All sizes are from the production Tailwind CSS design tokens:

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `text-xs` | 0.75rem / 12px | 1.333 | Labels, badges, caption text |
| `text-sm` | 0.875rem / 14px | 1.429 | Button text, table content, small body |
| `text-base` | 1rem / 16px | 1.5 | Default body text |
| `text-lg` | 1.125rem / 18px | 1.556 | Section intro paragraphs |
| `text-xl` | 1.25rem / 20px | 1.4 | Sub-section headings (H3) |
| `text-2xl` | 1.5rem / 24px | 1.333 | Section headings (H2) |
| `text-3xl` | 1.875rem / 30px | 1.2 | Page sub-headings |
| `text-4xl` | 2.25rem / 36px | 1.111 | Section titles |
| `text-5xl` | 3rem / 48px | 1.0 | Hero sub-headlines |
| `text-6xl` | 3.75rem / 60px | 1.0 | Hero headline |

### Font Weights

| Token | Value | Use Case |
|-------|-------|----------|
| `font-light` | 300 | Subtle supporting text |
| `font-normal` | 400 | Default body text |
| `font-medium` | 500 | Button labels, nav items, emphasized body |
| `font-semibold` | 600 | Sub-headings, card titles |
| `font-bold` | 700 | Section headings, H2, H3 |
| `font-extrabold` | 800 | Hero headlines, major feature titles |

### Typography Usage Guide for API Docs

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title (H1) | `text-4xl` / 36px | 800 (extrabold) | `#171918` |
| Section heading (H2) | `text-3xl` / 30px | 700 (bold) | `#171918` |
| Sub-section heading (H3) | `text-xl` / 20px | 600 (semibold) | `#171918` |
| Body text | `text-base` / 16px | 400 (normal) | `#525857` |
| Parameter name | `text-sm` / 14px | 600 (semibold) | `#0B618F` |
| Code inline | `text-sm` / 14px | 400 (normal) | `#24ACEE` |
| Table header | `text-xs` / 12px | 600 (semibold) | `#696F6E` |
| Table cell | `text-sm` / 14px | 400 (normal) | `#171918` |
| Badge / label | `text-xs` / 12px | 500 (medium) | varies |
| Navigation item | `text-sm` / 14px | 500 (medium) | `#525857` |
| Navigation item (active) | `text-sm` / 14px | 600 (semibold) | `#3AB75D` |

---

## Spacing System

Base unit: `0.25rem` (4px). All spacing is a multiple of this unit.

| Token | Value | Pixels |
|-------|-------|--------|
| `spacing-1` | 0.25rem | 4px |
| `spacing-2` | 0.5rem | 8px |
| `spacing-3` | 0.75rem | 12px |
| `spacing-4` | 1rem | 16px |
| `spacing-6` | 1.5rem | 24px |
| `spacing-8` | 2rem | 32px |
| `spacing-12` | 3rem | 48px |
| `spacing-16` | 4rem | 64px |

---

## Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| `radius-md` | 0.375rem / 6px | Input fields, small cards |
| `radius-lg` | 0.5rem / 8px | Cards, panels, dropdowns |
| `radius-xl` | 0.75rem / 12px | Feature cards, modals |
| `radius-2xl` | 1rem / 16px | Section containers, large cards |
| `radius-3xl` | 1.5rem / 24px | Hero sections, prominent panels |
| `radius-pill` | 9999px | Buttons (CTAs), tags, badges |

**Key rule:** CTA buttons use full pill radius (`9999px`). Content containers use `radius-lg` to `radius-2xl`.

---

## Buttons

### Primary Button (CTA)
```css
background-color: #3AB75D;
color: #FFFFFF;
border-radius: 9999px;        /* pill */
padding: 12px 16px;           /* py-3 px-4 */
font-size: 0.875rem;          /* text-sm */
font-weight: 500;             /* medium */
cursor: pointer;
```

**Hover state:** `background-color: #043B56` at 90% opacity (`#043B56E6`)

### Secondary / Ghost Button
```css
background-color: transparent;
color: #043B56;
border: 1px solid #E5EDEB;
border-radius: 9999px;
padding: 12px 16px;
font-size: 0.875rem;
font-weight: 500;
```

**Hover state:** `background-color: #043B56` at 10% opacity (`#043B561A`)

### For API Docs — HTTP Method Badges
Use pill-shaped badges with distinct colors per method:
| Method | Background | Text |
|--------|-----------|------|
| GET | `#EEF9FD` | `#0B618F` |
| POST | `#3AB75D` at 15% | `#3AB75D` |
| PUT / PATCH | `#F1F7F6` | `#525857` |
| DELETE | `#FEF2F2` | `#DC2626` |

---

## Component Patterns

### Navigation Bar
- **Background:** White (`#FFFFFF`)
- **Logo:** Vesicash wordmark — horizontal, left-aligned
- **Sub-brand label:** "Portal by Vesicash" shown as a secondary label
- **Nav links:** `text-sm`, `font-medium`, `#525857`, hover underline
- **CTA:** "Get Started" pill button, `#3AB75D`
- **Secondary action:** "Contact Sales" — text-only, `hidden sm:block` (hidden on mobile)

### Footer
- **Background:** Dark navy (`#011A27`)
- **Text:** Light sage (`#E5EDEB`) and white
- **Link color:** `#E5EDEB` with hover underline
- **Structure:** Multi-column with links, support emails, and physical office addresses
- **Geographic presence shown:** 🇳🇬 Lagos · 🇬🇭 Accra · 🇪🇬 Cairo · 🇺🇸 Delaware · 🇬🇧 London · 🇰🇪 Nairobi · 🇿🇲 Zambia · 🇷🇼 Kigali · 🇿🇦 Alberton · 🇹🇿 Tanzania

### Cards / Feature Panels
- **Background:** `#F1F7F6` or `#EEF9FD`
- **Border:** `1px solid #E5EDEB`
- **Border radius:** `radius-xl` (0.75rem) to `radius-2xl` (1rem)
- **Padding:** `spacing-6` to `spacing-8` (24–32px)
- **Heading:** `text-xl`, `font-semibold`, `#171918`
- **Body:** `text-base`, `font-normal`, `#525857`

### Input / Form Fields
- **Border:** `1px solid #E5EDEB`
- **Border radius:** `radius-md` (0.375rem)
- **Focus ring:** `#3AB75D` (1px ring)
- **Placeholder:** `#696F6E`
- **Background:** `#FFFFFF`

---

## Iconography & Imagery

### Icon Style
- Line/outline icons, not filled
- Monochromatic — color matches the surrounding text or uses `#24ACEE` for accent
- Sized at 1em (scales with text)
- Rendered via `nuxt-icon` (SVG-based, `fill: currentColor`)

### Illustration Style
- Geographic: Africa continent map motif (trust signal for African market coverage)
- Abstract background curves and gradients (not photographic)
- Globe imagery for global scope
- Partner/client logo grids (white or grayscale logos on colored backgrounds)

### Background Treatments
- Hero: Full-bleed image with a sky/aerial photo (`skye.png`) at 50% center, cover
- Feature sections: Decorative curve SVGs as background-image, positioned at edges
- No heavy gradients — mostly flat color fills with subtle decorative curves

---

## Layout Grid

- **Max content width:** 72rem (1152px) — `container-6xl`
- **Section padding:** `py-16` (64px top/bottom)
- **Column grid:** 12-column flexible grid (Tailwind default)
- **Breakpoints:**
  - Mobile: `< 768px`
  - Tablet: `768px`
  - Desktop: `1024px+`

---

## Design Personality & Tone (for API Docs)

### Adjectives that define the Vesicash brand:
- **Authoritative** — We understand African payments deeply
- **Reliable** — Infrastructure-grade, not a startup experiment
- **Clear** — No jargon for its own sake
- **Pan-African** — Celebrating and serving the continent, not just Nigeria

### What to carry into API docs:
1. **Dark navy backgrounds** for code blocks — matches the footer feel, looks premium
2. **Green (`#3AB75D`) as a trust/success color** — every successful response, every checkmark
3. **`#24ACEE` for inline code** — distinctive and brand-aligned, not generic gray
4. **Geographic context in examples** — use African currencies (NGN, GHS, KES, ZAR), African email addresses, African phone numbers in sample payloads
5. **Professional but not cold** — the site uses emoji flags (🇳🇬 🇬🇭) freely; the docs can be warm without being casual

### What NOT to carry into API docs:
- Hero background photos (too decorative for docs)
- Decorative SVG curves (add visual noise in reference pages)
- The Africa map illustration (belongs on the marketing site, not docs)

---

## Quick Reference Card

```
BRAND COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CTA / Success / Active     #3AB75D  ████ Green
Dark Background            #011A27  ████ Navy Deep
Primary Dark               #043B56  ████ Navy
Link / Accent Text         #0B618F  ████ Ocean Blue
Highlight                  #24ACEE  ████ Sky Blue
Light Section BG           #F1F7F6  ████ Off-White Green
Info BG                    #EEF9FD  ████ Pale Blue
Border                     #E5EDEB  ████ Sage
Primary Text               #171918  ████ Near Black
Secondary Text             #525857  ████ Dark Gray
Muted Text                 #696F6E  ████ Gray

FONT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UI & Body                  Inter (300, 400, 500, 600, 700, 800)
Code                       ui-monospace / SFMono / Menlo / Monaco

BORDER RADIUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buttons                    9999px (full pill)
Cards                      0.75rem – 1rem
Inputs                     0.375rem

BASE URL FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Production                 https://api.vesicash.com/v1
Sandbox                    https://sandbox.api.vesicash.com/v1
```
