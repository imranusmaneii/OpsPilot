# OpsPilot AI - Complete UI/UX Design Document

Enterprise Multi-Agent AI Operations Copilot — Full Design Reference

---

## Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [Global Styles & CSS Architecture](#2-global-styles--css-architecture)
3. [Tailwind Configuration](#3-tailwind-configuration)
4. [Typography System](#4-typography-system)
5. [Color System](#5-color-system)
6. [Component Patterns](#6-component-patterns)
7. [Animation System](#7-animation-system)
8. [Page-by-Page UI Documentation](#8-page-by-page-ui-documentation)
9. [Component Library Reference](#9-component-library-reference)
10. [Responsive Design](#10-responsive-design)
11. [State Management](#11-state-management)
12. [Navigation & Routing](#12-navigation--routing)

---

## 1. Design System Overview

OpsPilot uses a **dark-first, glassmorphism-driven** design language. The entire UI is built on a near-black navy background with translucent glass panels, subtle borders, and red/blue accent colors. There is no light mode — the theme is permanently dark.

**Core Design Principles:**
- Dark navy backgrounds with glassmorphism panels
- Red (`#DC2626`) as the primary action color
- Blue (`#2563EB`) as the secondary accent
- Subtle `rgba(255,255,255,0.06)` borders for depth
- Framer Motion animations on every page transition and interaction
- Inter font family for all text
- Rounded corners (`rounded-xl`, `rounded-2xl`) as the dominant shape language

**Tech Stack:**
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS 3.4
- Framer Motion for animations
- Zustand for state management
- Lucide React for icons (45+ unique icons)
- shadcn/ui (New York variant, configured but `ui/` directory empty — all components custom-built)
- Radix UI primitives configured but unused

---

## 2. Global Styles & CSS Architecture

### File: `src/app/globals.css`

### CSS Custom Properties

| Variable | Value | Usage |
|---|---|---|
| `--background` | `#050810` | Near-black deep navy — main app background |
| `--secondary` | `#0A0F1E` | Slightly lighter navy — sidebars, panels |
| `--card` | `rgba(255,255,255,0.03)` | Ghost-white translucent card surface |
| `--accent-red` | `#DC2626` | Primary accent — buttons, active states, glows |
| `--accent-blue` | `#2563EB` | Secondary accent — charts, alternate data |
| `--text-primary` | `#FFFFFF` | Pure white — primary text |
| `--text-secondary` | `#94A3B8` | Slate-400 — muted text, labels, descriptions |
| `--border` | `rgba(255,255,255,0.06)` | Near-invisible white — default borders |

### Theme Variants (Applied via Navbar)

| Theme | `--background` | `--secondary` | Description |
|---|---|---|---|
| **Dark** | `#050810` | `#0A0F1E` | Default — deep navy |
| **Midnight** | `#0B1120` | `#111827` | Slightly bluer dark |
| **OLED** | `#000000` | `#0A0A0A` | Pure black for OLED screens |

### Custom Utility Classes

| Class | Effect |
|---|---|
| `.glass` | Glassmorphism panel: `rgba(255,255,255,0.03)` background, `backdrop-filter: blur(24px)`, `1px solid rgba(255,255,255,0.06)` border |
| `.glass-hover:hover` | On hover: background rises to `rgba(255,255,255,0.06)`, border to `rgba(255,255,255,0.1)` |
| `.gradient-text` | Red gradient text: `linear-gradient(135deg, #FCA5A5, #F87171)` via `-webkit-background-clip: text` |
| `.gradient-border` | Gradient border via `::before` pseudo-element using CSS mask compositing: `linear-gradient(135deg, rgba(220,38,38,0.4), rgba(153,27,27,0.4))` |
| `.glow-purple` | Red glow: `box-shadow: 0 0 30px rgba(220, 38, 38, 0.12)` |
| `.glow-blue` | Blue glow: `box-shadow: 0 0 30px rgba(37, 99, 235, 0.12)` |
| `.text-glow` | Red text shadow: `text-shadow: 0 0 30px rgba(220, 38, 38, 0.4)` |
| `.scrollbar-thin` | 5px thin scrollbar with transparent track, `rgba(255,255,255,0.06)` thumb, 10px border-radius |

### Global Reset

- Universal `*`: margin 0, padding 0, box-sizing border-box
- `html`: smooth scroll behavior
- `body`: `font-family: Inter, system-ui, sans-serif`, antialiased rendering, `bg-background text-foreground`

### Keyframe Animations

| Name | Effect |
|---|---|
| `particle-float` | Moves elements in a complex path: Y 0 → -20 → -10 → -30 → 0, X 0 → 10 → -5 → 15 → 0, opacity cycles 0.3 → 0.6 → 0.4 → 0.7 → 0.3 |

---

## 3. Tailwind Configuration

### File: `tailwind.config.ts`

### Dark Mode
- Strategy: `"class"` — toggled via class on `<html>`

### Extended Colors

| Token | Value | Usage |
|---|---|---|
| `background` | `#050810` | App background |
| `foreground` | `#FFFFFF` | Primary text |
| `secondary` | `#0A0F1E` | Panel/sidebar background |
| `card` | `rgba(255,255,255,0.03)` | Card surfaces |
| `accent.red` | `#DC2626` | Primary action accent |
| `accent.blue` | `#2563EB` | Secondary action accent |
| `muted` | `#94A3B8` | Muted/secondary text |
| `border` | `rgba(255,255,255,0.06)` | Default border color |

### Extended Font Families

| Family | Stack |
|---|---|
| `sans` | `"Inter", "system-ui", "sans-serif"` |
| `mono` | `"JetBrains Mono", "monospace"` |

### Extended Animations

| Name | CSS Class | Effect |
|---|---|---|
| `fade-in` | `animate-fade-in` | Opacity 0 → 1 over 0.5s ease-in-out |
| `slide-up` | `animate-slide-up` | Opacity 0 + translateY(20px) → opacity 1 + translateY(0) over 0.5s |
| `glow` | `animate-glow` | Red glow cycles between 12% and 25% opacity, 2s infinite alternate |
| `float` | `animate-float` | translateY 0 → -10px → 0, 6s infinite |
| `pulse-soft` | `animate-pulse-soft` | Opacity 1 → 0.7 → 1, 2s infinite |

### Extended Backdrop Blur
- `xs`: `2px`

### Plugins
- `tailwindcss-animate` — additional animation utilities

---

## 4. Typography System

### Font Imports (Google Fonts)

**Inter** (primary):
- Weights: 300, 400, 500, 600, 700, 800
- Usage: All body text, headings, labels, buttons
- CSS variable: `--font-inter`

**JetBrains Mono** (monospace):
- Weights: 400, 500, 600
- Usage: Code blocks, metric values, JSON displays, latency numbers

### Type Scale

| Size | Tailwind Class | Pixels | Usage |
|---|---|---|---|
| Caption | `text-[10px]` | 10px | Metadata, timestamps, trace IDs |
| Extra Small | `text-xs` | 12px | Labels, descriptions, badges |
| Small | `text-sm` | 14px | Body text, form labels, nav items |
| Base | `text-base` | 16px | Default text |
| Large | `text-lg` | 18px | Section titles, empty state headings |
| Extra Large | `text-xl` | 20px | Chat empty state heading |
| 2XL | `text-2xl` | 24px | Page titles (Dashboard, Chat, Settings, etc.) |

### Font Weights Used

| Weight | Tailwind Class | Usage |
|---|---|---|
| Medium | `font-medium` | Body text, labels, nav items, button text |
| Semibold | `font-semibold` | Subsection headings, card names |
| Bold | `font-bold` | Page titles, KPI values, brand name |

### Text Colors

| Color | Tailwind Class | Hex | Usage |
|---|---|---|---|
| White | `text-white` | `#FFFFFF` | Primary headings, values, active text |
| Slate 300 | `text-[#CBD5E1]` | `#CBD5E1` | Hover nav text, user name in navbar |
| Slate 400 | `text-[#94A3B8]` | `#94A3B8` | Subtitles, descriptions, secondary text, labels |
| Slate 500 | `text-[#64748B]` | `#64748B` | Inactive nav text, login subtitles |
| Slate 600 | `text-[#475569]` | `#475569` | Input placeholders, icon colors, muted elements |
| Red 200 | `text-[#FCA5A5]` | `#FCA5A5` | Active nav text, selected items, active accent |
| Red 400 | `text-red-400` | — | Error text, delete actions, low scores |
| Red 600 | `text-[#DC2626]` | `#DC2626` | Primary accent in text, icon badges |
| Blue 400 | `text-[#60A5FA]` | — | Secondary metrics |
| Blue 600 | `text-[#2563EB]` | `#2563EB` | Secondary accent, processing states |
| Emerald 400 | `text-emerald-400` | — | Success states, high scores, green metrics |
| Yellow 400 | `text-yellow-400` | — | Warning states, medium scores |
| Amber 400 | `text-amber-400` | — | Warning metrics, amber data series |

---

## 5. Color System

### Primary Palette

| Name | Hex | RGB | Usage |
|---|---|---|---|
| Deep Navy | `#050810` | (5, 8, 16) | Main background |
| Panel Navy | `#0A0F1E` | (10, 15, 30) | Sidebars, panels, modals |
| Ghost White | `rgba(255,255,255,0.03)` | — | Card surfaces |
| Primary Red | `#DC2626` | (220, 38, 38) | CTA buttons, active states, glows |
| Dark Red | `#991B1B` | (153, 27, 27) | Button hover states, gradient endpoints |
| Light Red | `#FCA5A5` | (252, 165, 165) | Active nav text, selected items |
| Primary Blue | `#2563EB` | (37, 99, 235) | Secondary accent, processing, charts |

### Semantic Colors

| Semantic | Color Classes | Usage |
|---|---|---|
| **Success** | `emerald-400`, `bg-emerald-400/10` | Indexed status, high scores, active agents, current sessions |
| **Warning** | `amber-400`, `text-amber-400` | Medium scores, latency metrics |
| **Error** | `red-400`, `bg-red-500/10` | Failed status, low scores, error messages, delete actions |
| **Info** | `#2563EB`, `bg-[#2563EB]/10` | Processing status, secondary metrics |
| **Muted** | `#94A3B8`, `#64748B`, `#475569` | Labels, placeholders, inactive elements |

### Border Colors

| Level | Value | Usage |
|---|---|---|
| Subtle | `rgba(255,255,255,0.05)` | Inner separators, table rows |
| Default | `rgba(255,255,255,0.06)` | Card borders, input borders |
| Interactive | `rgba(255,255,255,0.08)` | Hover-ready borders, button borders |
| Active | `rgba(255,255,255,0.1)` | Hovered card borders |
| Focus Red | `rgba(220,38,38,0.4)` | Focused input border |

### Background Opacity Levels

| Level | Value | Usage |
|---|---|---|
| Ghost | `rgba(255,255,255,0.02)` | Inactive cards, subtle fills |
| Light | `rgba(255,255,255,0.03)` | Card backgrounds, glass panels |
| Medium | `rgba(255,255,255,0.04)` | Hover backgrounds |
| Active | `rgba(255,255,255,0.05)` | Hovered card backgrounds, focused inputs |
| Strong | `rgba(255,255,255,0.06)` | Glass hover state, hover backgrounds |

### Accent-Specific Backgrounds

| Accent | Background | Text | Border |
|---|---|---|---|
| Red Active | `bg-[#DC2626]/15` | `text-[#FCA5A5]` | `border-[#DC2626]/40` |
| Red Hover | `bg-[#DC2626]/10` | `text-[#DC2626]` | `border-[#DC2626]/30` |
| Red Faint | `bg-[#DC2626]/5` | — | `border-[#DC2626]/20` |
| Blue Active | `bg-[#2563EB]/10` | `text-[#2563EB]` | `border-[#2563EB]/40` |
| Green Active | `bg-emerald-400/10` | `text-emerald-400` | `border-emerald-400/20` |
| Amber Active | `bg-amber-400/10` | `text-amber-400` | `border-amber-400/20` |

### Chart Color Palette

| Series | Color | Hex |
|---|---|---|
| Primary (charts) | Red | `#DC2626` |
| Secondary (charts) | Blue | `#2563EB` |
| Tertiary | Emerald | `#10B981` / `emerald-400` |
| Quaternary | Amber | `#F59E0B` |
| Quinary | Red (alt) | `#EF4444` |

### Agent Pipeline Colors

| Agent | Color | Hex Classes |
|---|---|---|
| Planner | Red | `bg-red-500/10`, `border-red-500/30`, `text-red-400` |
| Retriever | Blue | `bg-blue-500/10`, `border-blue-500/30`, `text-blue-400` |
| Document QA | Cyan | `bg-cyan-500/10`, `border-cyan-500/30`, `text-cyan-400` |
| API Agent | Amber | `bg-amber-500/10`, `border-amber-500/30`, `text-amber-400` |
| Reasoning | Emerald | `bg-emerald-500/10`, `border-emerald-500/30`, `text-emerald-400` |
| Citation | Pink | `bg-pink-500/10`, `border-pink-500/30`, `text-pink-400` |
| Evaluator | Indigo | `bg-indigo-500/10`, `border-indigo-500/30`, `text-indigo-400` |

---

## 6. Component Patterns

### Card Pattern (Glass)
```
rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl
```
Used on: Settings panels, analytics cards, evaluation cards, knowledge base, model comparison results.

### Card Pattern (Glass Hover)
```
glass glass-hover rounded-2xl p-5
```
Used on: KPI cards, collection grid cards, document list items.

### Button Pattern (Primary)
```
rounded-xl bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white
hover:bg-[#991B1B] hover:shadow-lg hover:shadow-[#DC2626]/25
transition-all
```
Used on: All primary actions — Sign In, Create Account, Send, Run Pipeline, New Collection, Connect, Compare, Run.

### Button Pattern (Secondary)
```
rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-[#94A3B8]
hover:bg-[rgba(255,255,255,0.05)] hover:text-white
```
Used on: Cancel, secondary actions, settings saves.

### Button Pattern (Icon)
```
rounded-xl p-2.5 text-[#475569]
hover:bg-white/[0.06] hover:text-white
```
Used on: Navbar buttons, refresh buttons, theme toggle.

### Input Pattern
```
rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-white placeholder-[#475569]
focus:border-[#DC2626]/40 focus:bg-white/[0.05]
transition-all
```
Used on: All form inputs — login, register, chat, settings, search, prompt playground.

### Badge/Tag Pattern
```
rounded-lg bg-[#DC2626]/10 px-2.5 py-1 text-xs text-[#FCA5A5]
```
Used on: Model names, tool tags, active selections.

### Status Badge Pattern
```
rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400
```
Used on: Status indicators (Active, Indexed, Completed).

### Toggle Switch Pattern
- Container: `44x24px rounded-full`
- Active: `bg-[#DC2626]` with white dot at `left-[22px]`
- Inactive: `bg-white/[0.08]` with dot at `left-0.5`
- Transition: smooth slide

### Modal/Dialog Pattern
```
fixed inset-0 z-50 bg-black/60 backdrop-blur-sm  (backdrop)
fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2  (container)
rounded-2xl border border-white/[0.06] bg-[#0A0F1E] p-6 shadow-2xl  (card)
```
Animation: `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}`

### Empty State Pattern
```
flex flex-col items-center justify-center py-16 text-center
```
- Icon container: `h-16 w-16 rounded-2xl bg-[rgba(255,255,255,0.05)]` with `h-8 w-8 text-[#94A3B8]` icon
- Title: `text-lg font-semibold mb-2`
- Description: `max-w-sm text-sm text-[#94A3B8] mb-6`

### Loading Skeleton Pattern
```
animate-pulse rounded-xl bg-[rgba(255,255,255,0.05)]
```
PageSkeleton layout: header (title + subtitle) → 4-card grid → content area.

---

## 7. Animation System

### Framer Motion (Used Across All Components)

**Standard Page Entrance:**
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

**Staggered Children:**
```tsx
variants={{
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}}
```

**Hover Lift:**
```tsx
whileHover={{ y: -2, transition: { duration: 0.2 } }}
```

### Component-Specific Animations

| Component | Animation | Duration | Details |
|---|---|---|---|
| **Sidebar (desktop)** | Width 0 → 260px | 0.2s | `initial={{ width: 0, opacity: 0 }}` |
| **Sidebar (mobile)** | Slide from left -280 → 0 | 0.2s | Overlay fades in simultaneously |
| **Sidebar Active Indicator** | `layoutId="activeIndicator"` | — | Shared layout animation between nav items |
| **Command Palette** | Scale 0.95 → 1 + opacity + y | 0.15s | Backdrop fades in, palette scales up |
| **Chat Messages** | Fade-in + slide-up | default | `AnimatePresence` for enter/exit |
| **Chat File Upload** | Height 0 → auto + opacity | default | `AnimatePresence` for file list |
| **Upload Menu** | Scale + fade | default | `initial={{ opacity: 0, scale: 0.95 }}` |
| **KPI Cards** | Staggered entrance | 0.05s between | `staggerChildren: 0.05` |
| **Chart Cards** | Staggered delays | 0.1s between | Sequential 0.4, 0.5, 0.6, 0.7s |
| **LineChart Path** | Path drawing | 1.0s | `pathLength: 0 → 1`, easeOut |
| **LineChart Area** | Fade in | 0.8s | `opacity: 0 → 1` |
| **LineChart Dots** | Scale in | 0.05s between | Staggered with delay `i * 0.05 + 0.5` |
| **BarChart Bars** | Height grow | 0.5s between | `height: 0 → N%`, staggered `i * 0.05` |
| **DonutChart Segments** | Stroke drawing | 0.8s between | `strokeDasharray` animation, staggered `i * 0.1` |
| **Citation Cards** | Slide from right | 0.05s between | `opacity + x: 10 → 0` |
| **Comparison Table Rows** | Slide from left | 0.05s between | `opacity + x: -10 → 0` |
| **Execution Viewer** | Expand/collapse | 0.2s | Height 0 → auto + opacity |
| **MetricCard Progress** | Width fill | 0.8s | `width: 0 → percentage%`, easeOut |
| **Knowledge Base Cards** | Staggered entrance | 0.05s between | `opacity + y: 20 → 0` |
| **Document List Items** | Staggered entrance | 0.03s between | `opacity + y: 10 → 0` |
| **Collection Grid Cards** | Staggered entrance | 0.05s between | `opacity + y: 20 → 0` |
| **Modal** | Scale + opacity | default | `scale: 0.95 → 1`, `opacity: 0 → 1` |
| **Loading Spinner** | Continuous rotation | — | `animate-spin` on `Loader2`, `RefreshCw` |
| **Pipeline Nodes** | Pulse | — | SVG stroke-opacity cycles 0.3 → 0.8 → 0.3 |
| **Particles Background** | Float | 0-0.3 px/frame | Canvas requestAnimationFrame loop |

### CSS Animations (via Tailwind)

| Animation | Trigger | Effect |
|---|---|---|
| `animate-spin` | Loading states | 360° rotation on Loader2, RefreshCw icons |
| `animate-pulse` | Loading skeletons | Opacity pulsing on placeholder elements |
| `animate-fade-in` | Page transitions | Opacity 0 → 1, 0.5s |
| `animate-slide-up` | Page transitions | Opacity 0 + translateY(20px) → visible, 0.5s |
| `animate-glow` | Glow effects | Box-shadow red cycling, 2s infinite |
| `animate-float` | Decorative elements | translateY 0 → -10px → 0, 6s infinite |
| `animate-pulse-soft` | Subtle pulsing | Opacity 1 → 0.7 → 1, 2s infinite |

---

## 8. Page-by-Page UI Documentation

### 8.1 Root Home Page (`/`)

**Route:** `/`
**Layout:** Root layout only
**Behavior:** Immediately redirects to `/dashboard/chat`

**Visual:**
- Full-screen centered container: `flex h-screen items-center justify-center bg-[#050810]`
- Single loading spinner: 24x24px rounded circle, `border-2 border-[#DC2626] border-t-transparent`, `animate-spin`
- Only visible during the brief redirect moment

---

### 8.2 Login Page (`/login`)

**Route:** `/login`
**Layout:** Root layout (no dashboard shell)

**Background:**
- Full `min-h-screen` centered flex, `bg-[#050810]`, `px-4`
- Two decorative blurred gradient orbs:
  - Center: 500x500px, `bg-[#DC2626]/[0.04]`, `blur-[120px]`
  - Left: 300x300px at left-1/4 top-1/3, `bg-[#2563EB]/[0.03]`, `blur-[100px]`

**Card (Glassmorphism):**
- `max-w-md`, `rounded-2xl`, `p-8`, `.glass` utility
- Motion entrance: fade-in + slide-up, 0.6s

**Logo/Brand:**
- 48x48px `rounded-xl` container with `bg-gradient-to-br from-[#DC2626] to-[#2563EB]`
- `shadow-lg shadow-[#DC2626]/20`
- Contains `<Sparkles>` icon (white, 24x24)

**Headings:**
- "Welcome back": `text-2xl font-bold text-white`
- "Sign in to OpsPilot AI": `text-sm text-[#64748B]`

**Google Sign-In Button:**
- Full-width: `rounded-xl border border-white/[0.08] bg-white/[0.03]`, `py-3 px-4`, `text-sm font-medium text-white`
- Contains 4-color Google SVG logo + "Continue with Google"
- Hover: `hover:bg-white/[0.06]`, Disabled: `opacity-50`

**Divider:**
- Horizontal line with centered "or" label
- `border-t border-white/[0.06]`, uppercase text, `bg-[#0A0F1E]` background behind text

**Error Display:**
- Conditional: `rounded-xl border border-red-500/20 bg-red-500/5`, `text-sm text-red-400`

**Form:**
- Labels: `text-sm font-medium text-[#64748B]`
- Inputs: `rounded-xl border border-white/[0.06] bg-white/[0.03]`, `px-4 py-3`, `text-white`, `placeholder-[#475569]`
- Focus: `focus:border-[#DC2626]/40 focus:bg-white/[0.05]` — red border glow
- Password: Eye/EyeOff toggle at right edge, `text-[#475569]` → `text-[#94A3B8]`

**Submit Button:**
- Full-width: `rounded-xl bg-[#DC2626] px-4 py-3 font-medium text-white`
- Hover: `hover:bg-[#991B1B]` + `hover:shadow-lg hover:shadow-[#DC2626]/25`
- Loading: `<Loader2 className="animate-spin">`
- Normal: "Sign In" + `<ArrowRight>` icon

**Footer:**
- "Don't have an account? Sign up" — link: `text-[#FCA5A5]` hover → `text-[#C4B5FD]` (purple shift)

---

### 8.3 Register Page (`/register`)

**Route:** `/register`
**Layout:** Root layout

**Identical to Login with:**
- Heading: "Create your account"
- Subtitle: "Start using OpsPilot AI"
- Google button: "Sign up with Google"
- Extra field: Full Name input (`placeholder="John Doe"`, `type="text"`) — placed first
- Submit: "Create Account"
- Footer: "Already have an account? Sign in" → `/login`
- Same background orbs, glass card, colors, animations

---

### 8.4 Chat Redirect (`/chat`)

**Route:** `/chat`
**Layout:** Root layout
**Behavior:** Centered red spinner, immediately redirects to `/dashboard/chat`

---

### 8.5 Dashboard Layout (Wraps All `/dashboard/*`)

**File:** `src/app/dashboard/layout.tsx`

**Structure:**
```
<div flex h-screen bg-[#050810]>
  <CommandPalette />                    -- Global Cmd+K overlay
  <Sidebar isOpen onClose />            -- Left sidebar, 260px wide
  <div flex flex-1 flex-col overflow-hidden>
    <Navbar onMenuClick />             -- Top bar, 64px height
    <main flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin>
      {children}                       -- Page content
    </main>
  </div>
</div>
```

**Responsive:**
- Mobile: Sidebar is overlay (slide-in from left), toggled via hamburger
- Desktop: Sidebar is fixed, content fills remaining space
- Main padding: `p-4` mobile, `md:p-6` desktop

---

### 8.6 Dashboard Home (`/dashboard`)

**Route:** `/dashboard`
**Layout:** Dashboard layout

**Header:**
- "Dashboard": `text-2xl font-bold`
- "Overview of your AI operations platform": `text-sm text-[#94A3B8]`
- Refresh button: `rounded-xl border`, `<RefreshCw>` spins when loading

**KPI Cards Grid:**
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- 8 KPI cards with staggered animation (0.05s between):

| Card | Icon | Color | Value | Change |
|---|---|---|---|---|
| Documents Indexed | `FileText` | Purple (red) | — | +12% |
| Questions Answered | `MessageSquare` | Blue | — | +23% |
| Total Tokens | `Zap` | Purple | XK | +15% |
| Agent Health | `Activity` | Blue | 99.8% | +0.2% |
| Embedding Count | `Database` | Purple | XK | +15% |
| Evaluations | `Brain` | Blue | — | +0.03 |
| Avg Latency | `Timer` | Purple | X.Xs | -18% |
| Cost MTD | `TrendingUp` | Blue | $X | -5% |

**Charts Row (2-column):**
1. **Usage Over Time** — `glass rounded-2xl p-6`, BarChart, height 180, red, "Last 30 days"
2. **Cost Over Time** — Same container, BarChart, blue (`#2563EB`)

**Bottom Row (3-column, 2+1):**
1. **Response Latency** (`lg:col-span-2`) — LineChart, 3 series:
   - P50 (red `#DC2626`), P90 (blue `#2563EB`), P99 (emerald), height 200
   - Static Mon-Sun data with decreasing trend
2. **Agent Status** — Agent list with status indicators:
   - Each: `rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-3`
   - Green dot (`bg-emerald-400`) for active, gray for inactive
   - 6 hardcoded agents: Planner, Retriever, Document QA, API, Reasoning, Evaluator

---

### 8.7 Chat (`/dashboard/chat`)

**Route:** `/dashboard/chat`
**Layout:** Dashboard layout

**Header:**
- "Chat": `text-2xl font-bold`
- Dynamic subtitle: document count or "Ask questions about your documents"
- New Chat button: `<RotateCcw>`, appears when messages exist

**Chat Container:**
- `flex h-[calc(100vh-8rem)]`
- `rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]`

**Empty State:**
- Centered column
- Red sparkle: `<Sparkles>` in `rounded-2xl bg-[#DC2626]/10 p-4`
- "Ask OpsPilot AI": `text-xl font-semibold`
- Subtitle: `text-sm text-[#94A3B8]`
- Upload button: dashed border `border-dashed border-[#DC2626]/40 bg-[#DC2626]/5`
- 3 suggested question pills: `rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]`, hover → red

**Message Bubbles:**
- **User:** Right-aligned, `bg-[#DC2626]/20 text-white`, `rounded-2xl px-4 py-3`, max-width 70%
  - Avatar: 32x32px `rounded-xl bg-[rgba(255,255,255,0.05)]` with `<User>` icon
- **Assistant:** Left-aligned, `.glass` background, max-width 70%
  - Avatar: 32x32px `rounded-xl bg-[#DC2626]/20` with `<Bot>` icon (red)
  - Markdown: Bold, italic, inline code (`bg-white/5`), bullet/numbered lists
  - Loading: "Thinking..." with `<Loader2 animate-spin>`
  - Sources: "Sources" label + pill chips with `<FileText>` icon + score percentage
  - Metadata: `<Clock>` latency, `<Zap>` model — `text-[10px] text-[#94A3B8]/60`

**Input Area (bottom, top border):**
- Document chips: File pills with `<FileText>`, truncated name, size, `<X>` remove, red scheme
- Upload button: 44x44px `rounded-xl`, hover red with border
  - Upload menu dropdown: animated popup, `absolute bottom-14 left-0 z-50 w-56`, `bg-[#0A0F1E]`, `shadow-2xl`
  - Options: "Upload files" + "Paste text (coming soon)"
- Textarea: auto-expanding (min 44px, max 120px), `rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)]`
- Send button: 44x44px `rounded-xl bg-[#DC2626]`, loading spinner
- Hidden file input: `.pdf,.docx,.doc,.txt,.md,.csv,.json,.js,.ts,.py,.html,.css,.xml,.yaml,.yml,.log`

**Client-Side Processing:**
- PDF text extraction via pdf.js (CDN)
- DOCX extraction via mammoth.js (CDN)
- Entity extraction: names, dates, organizations, numbers, titles (regex)
- Document type detection: certificate, invoice, resume, contract, report, research paper, manual
- Streaming: word-by-word at 12ms intervals (demo mode) or SSE (backend)

---

### 8.8 Analytics (`/dashboard/analytics`)

**Route:** `/dashboard/analytics`
**Layout:** Dashboard layout

**Header:**
- "Analytics": `text-2xl font-bold`
- "Usage statistics and performance metrics"
- Refresh button

**4-Chart Grid (2x2):**
1. **Daily Usage** — BarChart (red), `<BarChart3>` icon in `text-[#DC2626]`, height 200
2. **Token Usage** — BarChart (blue), `<Cpu>` icon in `text-[#2563EB]`
3. **Latency Distribution** — LineChart (green), `<Clock>` icon in `text-emerald-400`, 3 series: avg/min/max
4. **Cost Breakdown** — DonutChart, `<DollarSign>` icon in `text-[#F59E0B]`, size 160, thickness 20
   - Center shows total dollar amount
   - Colors: `["#DC2626", "#2563EB", "#10B981", "#F59E0B", "#EF4444"]`

**Model Comparison Table (conditional):**
- Full-width in `glass rounded-2xl p-6`
- Headers: Model, Requests, Avg Latency, Avg Tokens, Total Cost
- Rows: alternating borders, `font-mono` for numbers
- `overflow-x-auto` for mobile

---

### 8.9 Settings (`/dashboard/settings`)

**Route:** `/dashboard/settings`
**Layout:** Dashboard layout

**Tab Navigation (left sidebar on desktop, horizontal on mobile):**
- 5 tabs in `md:w-56` column, `md:rounded-2xl md:border md:border-white/[0.06] md:bg-[#0A0F1E]/60 md:p-2 md:backdrop-blur-xl`

| Tab | Icon | Key |
|---|---|---|
| Profile | `User` | profile |
| API Keys | `Key` | api-keys |
| Notifications | `Bell` | notifications |
| Security | `Shield` | security |
| Appearance | `Palette` | appearance |

- Active: `bg-[#DC2626]/15 text-[#FCA5A5]`
- Inactive: `text-[#475569] hover:bg-white/[0.04] hover:text-[#94A3B8]`

#### Tab: Profile
- Avatar: 80x80px `rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#2563EB]`, initials "OP", `shadow-lg shadow-[#DC2626]/20`
- "Admin User", "admin@opspilot.ai", "Member since Jan 2025"
- Form fields (2x2 grid): Full Name, Email, Role, Organization
- Save button: `bg-[#DC2626]`, shows `<Check>` + "Saved!" for 2 seconds

#### Tab: API Keys
- Two key cards:
  1. Production: `<Sparkles>` icon, "Active" green badge, show/hide toggle, copy, regenerate
  2. Development: `<Key>` icon, "Inactive" gray badge, masked
- Usage Limits (3 metric cards):
  - Requests Today: 1,247 — red progress bar at 62%
  - Tokens This Month: 2.4M — blue progress bar at 48%
  - Cost This Month: $18.42 — green progress bar at 18%

#### Tab: Notifications
- 6 toggle switches, each in a card:
  - Document indexing complete (on), Evaluation finished (on), API key warnings (on)
  - New integration available (off), Weekly summary (off), Security alerts (on)

#### Tab: Security
- Change Password: 3 fields (Current, New, Confirm)
- Sessions: 2 session cards (Chrome on Windows — "Current" green badge, Safari on macOS — "Revoke" in red)

#### Tab: Appearance
- **Theme Selection:** 3 buttons — Dark (`#050810`), Midnight (`#0B1120`), OLED (`#000000`)
  - Active: `border-[#DC2626]/40 bg-[#DC2626]/10 text-[#FCA5A5]`
- **Accent Color:** 6 circles (Red, Blue, Emerald, Amber, Red, Pink)
  - 36x36px, active has `ring-2 ring-offset-2 ring-offset-[#0A0F1E]`, hover `scale-110`
- **Live Preview:** Dot, progress bar, and button in selected accent color
- **Sidebar Compact Mode toggle:** "Show only icons in sidebar"

---

### 8.10 Documents (`/dashboard/documents`)

**Route:** `/dashboard/documents`
**Layout:** Dashboard layout

**List View (default):**
- "Documents": `text-2xl font-bold`
- "View and manage your indexed documents"
- `<DocumentList>` component

**Detail View (document selected):**
- Back button: `rounded-lg border`, `<ArrowLeft>`
- Header: title + filename + `<ConfidenceBadge>` (score 0.95)
- Two-column: `lg:grid-cols-3` (2:1 split)
  - Left: `<PdfViewer>` component
  - Right:
    - Document Info card (Status, Chunks, Embedding Model)
    - Chunks list: scrollable (`max-h-96`), each chunk: `rounded-xl border p-3`, shows index, page, tokens, content preview (line-clamp-3)

---

### 8.11 Cost Estimator (`/dashboard/cost-estimator`)

**Route:** `/dashboard/cost-estimator`
**Layout:** Dashboard layout

**Header:**
- "Cost Estimator"
- "Estimate and optimize your AI spending"

**Scenario Presets (horizontal scroll):**
- 5 scenarios: Simple Chat, RAG Query, Document Summarization, Code Generation, Batch Processing
- Active: `border-[#DC2626]/50 bg-[#DC2626]/10`
- Inactive: `border-white/10 bg-white/5 hover:bg-white/[0.08]`

**Input Fields (3-column):**
- Input Tokens (1000), Output Tokens (500), Monthly Requests (10,000)

**Per-Request Cost Grid (3-column, 7 model cards):**
- Each: model name + total cost + animated progress bar + input/output breakdown
- Color-coded: GPT-4o (red), GPT-4o Mini (blue), GPT-4 Turbo (pink), Claude 3.5 (amber), Claude 3 Haiku (emerald), Embedding Small (indigo), Embedding Large (violet)

**Monthly Projection (top 5):**
- Model + monthly cost, toggleable breakdown

**Cost Optimization Tips:**
- Red-accented info card: `rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5`
- 4 tips with `<Zap>` icons

---

### 8.12 Agents (`/dashboard/agents`)

**Route:** `/dashboard/agents`
**Layout:** Dashboard layout

**Header:**
- "Agents": `text-2xl font-bold`
- "Monitor and configure your multi-agent AI pipeline"
- "Run Pipeline" button: `bg-[#DC2626]`, spinner when running

**Stats Row (4-column):**
- Total Agents: 7 (`text-[#FCA5A5]`)
- Total Runs: ~14,600 (`text-[#60A5FA]`)
- Avg Success: ~97.3% (`text-emerald-400`)
- Avg Latency: ~206ms (`text-[#F59E0B]`)

**3-Tab Interface:**

#### Tab: Workflow Graph
- SVG-based pipeline visualization (500x680px viewBox)
- 7 nodes vertically with edges and arrowheads
- Each node: 200x80 rounded rectangle, colored by agent type
- Edge arrows: Red gradient markers with animated circles during execution
- Edge labels: "decompose", "context", "external", "answers", "data", "reasoned", "cited"
- Running state: Pulsing border + node circle animation
- Done state: Green dot, enriched background
- Click node → detail panel (agent stats, tools, description)
- Run Logs panel during/after execution

#### Tab: Agent List
- 3-column grid of agent cards
- Each: `<Bot>` icon, name, truncated description
- 3-stat grid: Runs, Latency, Success rate
- Tools as red pill tags

#### Tab: Execution History
- 6 demo run entries as expandable accordions
- Each: status icon (green/blue/red), agent name, timestamp, latency, tools
- Expanded: Input/Output pre blocks + tools

**7 Agents:** Planner, Retriever, Document QA, API Agent, Reasoning, Citation, Evaluator

---

### 8.13 Knowledge Base (`/dashboard/knowledge-base`)

**Route:** `/dashboard/knowledge-base`
**Layout:** Dashboard layout

**Header:**
- "Knowledge Base"
- "New Collection" button: `bg-[#DC2626]`, `<Plus>` icon

**Collection Grid:**
- Search bar: `<Search>` icon, `rounded-xl`
- 3-column responsive grid of collection cards
- Each: `<Folder>` icon (red bg), name, description (2-line clamp), doc count
- Delete button appears on hover (opacity-0 → opacity-100)
- 4 demo collections: Product Documentation (24), Engineering RFCs (12), Incident Reports (8), Security Policies (15)

**Collection Detail View:**
- Back button
- Upload Zone (drag & drop):
  - `rounded-2xl border-2 border-dashed p-8`
  - Normal: `border-white/[0.1] bg-white/[0.02]`
  - Dragging: `border-[#DC2626] bg-[#DC2626]/10`
  - Hover: `hover:border-[#DC2626]/50`
  - Accepted: PDF, DOCX, Markdown, CSV, JSON, PNG, JPG
- File upload list: progress bars (red uploading, green done, red error), remove button

**Create Modal:**
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Modal: `max-w-md`, `rounded-2xl`, `bg-[#0A0F1E]`, `shadow-2xl`
- Form: Name input + Description textarea (3 rows)
- Buttons: Cancel + Create (red)

---

### 8.14 Integrations (`/dashboard/integrations`)

**Route:** `/dashboard/integrations`
**Layout:** Dashboard layout

**Header:**
- "Integrations"
- "Connect your tools to enhance OpsPilot's knowledge"

**Stats Row (4-column):**
- Connected (green), Total Synced (red), Available (gray), Last Sync (gray)

**2-Tab Interface:**

#### Tab: Connected
- Integration cards (list layout)
- Each: Provider icon (color-coded), name + status badge (Active=green, Error=red, Inactive=gray)
- Description, last sync, sync count
- Actions: Sync (spinner), Settings, Delete (hover red)
- 3 demos: GitHub (847), Slack (2341), Notion (inactive)

#### Tab: Available
- Search bar with `<Zap>` icon
- 2-column grid of provider cards
- Each: icon + name + category badge + description + Connect button
- 8 providers: GitHub, Slack, Notion, Jira, Google Drive, Confluence, Linear, Webhooks

---

### 8.15 Model Comparison (`/dashboard/model-comparison`)

**Route:** `/dashboard/model-comparison`
**Layout:** Dashboard layout

**Header:**
- "Model Comparison"
- "Compare LLM performance side by side"

**Model Selection (4-column):**
- 4 model cards: GPT-4o, GPT-4o Mini, Claude 3.5 Sonnet, Claude 3 Haiku
- Toggleable: Active = `border-[#DC2626]/50 bg-[#DC2626]/10` + `<CheckCircle>`
- Shows: provider, params, context window, pricing

**Test Prompt:**
- Full-width input + "Compare" button (red)

**Suggested Prompts:** 4 pill buttons

**Results (2-column):**
- Left: Performance Radar — per-model card with 5 benchmark bars (Speed, Quality, Reasoning, Code, Cost Efficiency), animated gradient bars (`#DC2626` → `#2563EB`), score 0-100
- Right: Expandable model result cards with latency, tokens, full output

---

### 8.16 Playground (`/dashboard/playground`)

**Route:** `/dashboard/playground`
**Layout:** Dashboard layout

**Header:**
- "Prompt Playground"
- "Test and iterate on prompts with real-time feedback"

**Template Row (4-column):**
- 4 templates: RAG Q&A, Summarize, Extract Entities, Classify
- Each with `<BookOpen>` icon in red

**Two-Panel Layout (`xl:grid-cols-2`):**

**Left Panel:**
- System Prompt: textarea (4 rows)
- User Prompt: textarea (6 rows)
- Controls: Model select, Temperature range (0-2, accent `#DC2626`), Run button (red + `<Play>`)

**Right Panel:**
- Output area: min-height 300px, `rounded-xl border border-white/10 bg-white/5 p-4`
- Loading: red spinner
- Empty: "Output will appear here..."
- Copy/Reset buttons
- Stats: Latency, Tokens, Cost badges

**Recent Runs (bottom):**
- Up to 10 runs: timestamp, model badge (`bg-[#DC2626]/15`), truncated prompt

---

### 8.17 Evaluation (`/dashboard/evaluation`)

**Route:** `/dashboard/evaluation`
**Layout:** Dashboard layout

**Header:**
- "Evaluation"
- "Measure and improve your RAG pipeline quality"
- Refresh + "New Evaluation" button (red)

**Metric Cards (4-column):**
1. Faithfulness — Brain icon, purple (red)
2. Answer Relevancy — Target icon, blue
3. Context Precision — BarChart3 icon, green
4. Hallucination Rate — AlertTriangle icon, amber/red

**Two-Column Charts:**
1. Regression History — `<RegressionChart>` (3-series LineChart)
2. Model Comparison — `<ComparisonTable>` with hardcoded data

**Evaluation History:**
- Status icons: green check (completed), blue spinner (running), gray clock (pending)
- Name, samples, model, date
- Metrics inline (monospace)
- "Run" button for pending

**Create Modal:** Name input + "Create & Run" button

---

### 8.18 Embeddings Explorer (`/dashboard/embeddings`)

**Route:** `/dashboard/embeddings`
**Layout:** Dashboard layout

**Header:**
- "Embeddings Explorer"
- "Visualize and analyze document embeddings in 2D space"
- Info toggle

**Info Panel:** Red-accented explanation card about t-SNE

**Toolbar:** Search, Zoom In/Out, Reset

**Main Layout: `lg:grid-cols-4` (3+1)**

**Canvas (3 cols):**
- 900x550px HTML5 Canvas
- 10x10 grid lines (`rgba(255,255,255,0.025)`)
- 250 points across 5 clusters
- Cluster colors: Red, Blue, Pink, Amber, Emerald
- Glow effects + border rings per point
- Connection lines between nearby same-cluster points
- Hover tooltip: document label, cluster name, similarity score
- Status bar: doc count, zoom level, embedding model
- Crosshair cursor

**Right Panel (1 col):**
1. Clusters: "All Clusters" + 5 named (Technical, Business, Legal, Research, Operations)
2. Model selector: 4 models (text-embedding-3-small/large, ada-002, voyage-2)
3. Statistics: Total Vectors, Dimensions, Reduction method, Avg Similarity (0.847), Clusters (5)

---

## 9. Component Library Reference

### 9.1 Sidebar (`components/layout/sidebar.tsx`)

**Width:** 260px open
**Background:** `bg-[#0A0F1E]/95 backdrop-blur-2xl`
**Border:** `border-white/[0.06]`

**Brand Header (64px height):**
- Logo: 36x36px `rounded-xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] shadow-lg shadow-[#DC2626]/20`
- Name: `text-sm font-bold tracking-tight text-white` = "OpsPilot"
- Subtitle: `text-[10px] font-medium tracking-widest uppercase text-[#DC2626]` = "AI Platform"

**13 Navigation Items:**

| Item | Icon | Route |
|---|---|---|
| Dashboard | `LayoutDashboard` | `/dashboard` |
| Knowledge Base | `Database` | `/dashboard/knowledge-base` |
| Documents | `FileText` | `/dashboard/documents` |
| Chat | `MessageSquare` | `/dashboard/chat` |
| Agents | `Bot` | `/dashboard/agents` |
| Analytics | `BarChart3` | `/dashboard/analytics` |
| Evaluation | `FlaskConical` | `/dashboard/evaluation` |
| Playground | `Sparkles` | `/dashboard/playground` |
| Model Comparison | `Layers` | `/dashboard/model-comparison` |
| Cost Estimator | `DollarSign` | `/dashboard/cost-estimator` |
| Embeddings | `Network` | `/dashboard/embeddings` |
| Integrations | `Plug` | `/dashboard/integrations` |
| Settings | `Settings` | `/dashboard/settings` |

**Active State:**
- `bg-[#DC2626]/15 text-[#FCA5A5] shadow-sm shadow-[#DC2626]/10`
- Animated red dot indicator: `layoutId="activeIndicator"`, `h-1.5 w-1.5 rounded-full bg-[#DC2626]`
- Active icon: `#FCA5A5`, active text: `#FCA5A5`

**Inactive State:**
- `text-[#64748B] hover:bg-white/[0.04] hover:text-[#CBD5E1]`
- Inactive icon: `#475569`, hover icon: `#94A3B8`

**Nav Item Layout:** `rounded-xl px-3 py-2.5 text-sm font-medium`, flex with gap-3, icon `h-[18px] w-[18px]`

**Footer:** `rounded-xl bg-[#DC2626]/10 p-3`
- "OpsPilot AI v0.1.0": `text-xs font-medium text-[#FCA5A5]`
- "Enterprise AI Operations": `text-[10px] text-[#475569]`

**Close Button (top right):** `rounded-lg p-1.5 text-[#475569] hover:bg-white/[0.06] hover:text-white`

**Responsive:**
- Desktop (`md:flex`): Animated width collapse (0 → 260px)
- Mobile (`md:hidden`): Fixed overlay slide-in from left (-280 → 0), backdrop `bg-black/60 backdrop-blur-sm`

---

### 9.2 Navbar (`components/layout/navbar.tsx`)

**Height:** 64px (`h-16`)
**Background:** `bg-[var(--secondary,#0A0F1E)]/60 backdrop-blur-2xl`
**Border:** bottom `white/[0.06]`

**Left Section:**
- Hamburger: `rounded-xl p-2`, text `#475569`, hover `bg-white/[0.06] text-white`
- Search bar: `rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2`
  - Contains Search icon + "Search..." + `Cmd+K` badge (`rounded-md border bg-white/[0.04] text-[10px]`)
  - Hover: `border-[#DC2626]/20 bg-white/[0.05] text-[#94A3B8]`
  - Click opens command palette

**Right Section:**
- Theme cycle: `rounded-xl p-2.5` — cycles dark → midnight → oled
  - Icons: dark=Moon, midnight=Monitor, oled=Sun
- Notification bell: `rounded-xl p-2.5` + red dot indicator (`h-2 w-2 rounded-full bg-[#DC2626] shadow-sm shadow-[#DC2626]/50`)
- User avatar: `rounded-xl border bg-white/[0.03] px-3 py-1.5`
  - Avatar: `h-7 w-7 rounded-lg bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-[10px] font-bold text-white`
  - Name: `text-sm font-medium text-[#CBD5E1]` (hidden on sm)

---

### 9.3 Command Palette (`components/layout/command-palette.tsx`)

**Trigger:** `Ctrl/Cmd + K`
**Backdrop:** `fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm`
**Container:** `fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg z-[100]`
**Card:** `rounded-2xl border border-white/[0.08] bg-[#0A0F1E] p-2 shadow-2xl backdrop-blur-xl`

**Search Header:**
- Search icon (5x5, #94A3B8) + input + ESC badge

**Command List:** `max-h-80 overflow-y-auto p-2 scrollbar-thin`
- Each: `rounded-xl px-3 py-2.5 text-sm`, icon + label + ArrowRight
- Selected: `bg-[#DC2626]/15 text-[#FCA5A5]`
- Default: `text-[#94A3B8] hover:bg-white/[0.05] hover:text-white`

**12 Commands:** Dashboard, Knowledge Base, Documents, Chat, Agents, Evaluation, Playground, Model Comparison, Cost Estimator, Embeddings, Integrations, Settings

**Animation:** Scale 0.95→1 + opacity + y, 0.15s

---

### 9.4 KPI Card (`components/dashboard/kpi-card.tsx`)

**Card:** `.glass .glass-hover rounded-2xl p-5 cursor-pointer`
**Layout:** flex row, justify-between — title+value left, icon right
- Title: `text-sm text-[#94A3B8]`
- Value: `text-2xl font-bold` (white)
- Change: `text-xs font-medium`, emerald-400 if `+`/`-`
- Icon badge: `rounded-xl p-2.5`
  - Purple (red): `bg-[#DC2626]/10 text-[#DC2626]`
  - Blue: `bg-[#2563EB]/10 text-[#2563EB]`

**Hover:** `whileHover={{ y: -2 }}`, icon `group-hover:bg` 20% opacity

---

### 9.5 Bar Chart (`components/dashboard/charts/bar-chart.tsx`)

**Layout:** `flex items-end gap-2` at configurable height
- Each bar: `w-full rounded-t-lg`, min-height 4px
- Value labels above: `text-[10px] text-[#94A3B8]`
- X-axis labels below: `text-[10px] text-[#94A3B8] truncate`
- Bars are `flex-1` for equal distribution

**Animation:** `motion.div` per bar: `height: 0 → N%`, staggered `i * 0.05`, 0.5s easeOut

---

### 9.6 Line Chart (`components/dashboard/charts/line-chart.tsx`)

**SVG:** `viewBox="0 0 100 100"` with `preserveAspectRatio="none"` for fluid scaling
- 5 horizontal grid lines at y=0,25,50,75,100
- Line: 0.8px stroke, rounded caps/joins
- Area gradient: `linearGradient` from color at 30% opacity to transparent
- Dots: 1.2px radius circles

**Animation:**
- Path drawing: `pathLength: 0 → 1`, 1s easeOut
- Area fade-in: `opacity: 0 → 1`, 0.8s
- Dots: staggered scale 0→1, delay `i * 0.05 + 0.5`

---

### 9.7 Donut Chart (`components/dashboard/charts/donut-chart.tsx`)

**SVG:** Size 160px, thickness 20px
- Outer circle: `rgba(255,255,255,0.05)` stroke
- Segments: colored strokes, `strokeLinecap="round"`, rotated -90° (starts from top)
- Center: optional `centerValue` (text-lg bold) + `centerLabel` (text-[10px])
- Legend: vertical list with colored dots + labels + percentages

**Animation:** `strokeDasharray: 0 → target`, staggered `i * 0.1`, 0.8s easeOut

---

### 9.8 Agent Graph (`components/agents/agent-graph.tsx`)

**SVG Canvas:** 500x780px, centered
- 7 nodes: 200x80 rounded rectangles (`rx="16"`)
- Color scheme per agent (see Agent Pipeline Colors above)
- Status dots: active=emerald-400, idle=#94A3B8, error=red-400 (4px radius)
- Edges: `linearGradient` from `#DC2626` to `#2563EB` at 40% opacity, with arrowhead markers
- Labels: 10px #94A3B8
- Active node: shadow glow + thicker border (2 vs 1)
- Legend bar at top-right

---

### 9.9 Execution Viewer (`components/agents/execution-viewer.tsx`)

**Layout:** `space-y-2` vertical stack
- Each card: `rounded-xl border bg-[rgba(255,255,255,0.03)]`
- Status icons with color-coded badges (pending=clock/blue, running=spinner/blue, completed=check/green, failed=alert/red)
- Expanded: 2-column grid with Input/Output `<pre>` blocks
- Tools: red pill tags
- Error: `rounded-lg bg-red-500/5 text-red-400`
- Metadata: 10px text, 60% opacity

**Animation:** Expand/collapse with height 0→auto + opacity, 0.2s

---

### 9.10 Upload Zone (`components/knowledge-base/upload-zone.tsx`)

**Drop Zone:** `rounded-2xl border-2 border-dashed p-8`, flex column centered
- Default: `border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]`
- Dragging: `border-[#DC2626] bg-[#DC2626]/10`
- Hover: `border-[#DC2626]/50 bg-[rgba(255,255,255,0.05)]`

**File List:** Each file with name, size, status icon (spinner/check/alert), remove button

**Animation:** `AnimatePresence` + height/opacity per file entry

---

### 9.11 Document List (`components/knowledge-base/document-list.tsx`)

**Layout:** `space-y-2`
- Each row: `.glass .glass-hover group rounded-xl p-4`, flex with gap-4
- Icon: `rounded-xl bg-[#DC2626]/10 p-2.5`
- Status badges: pending=clock, processing=spinner, indexed=check, failed=alert
- Empty state: 64x64 icon container

**Animation:** Staggered `opacity + y: 10 → 0`, delay `i * 0.03`

---

### 9.12 Collection Grid (`components/knowledge-base/collection-grid.tsx`)

**Grid:** `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`
- Each card: `.glass .glass-hover group rounded-2xl p-5`
- Delete button: opacity-0 group-hover:opacity-100, hover red
- Empty state: 64x64 Database icon

**Animation:** Staggered `opacity + y: 20 → 0`, delay `i * 0.05`

---

### 9.13 Confidence Badge (`components/documents/confidence-badge.tsx`)

**Inline badge** with status dot + percentage:
- ≥80%: emerald-400
- ≥60%: yellow-400
- <60%: red-400
- Sizes: sm (10px), md (12px), lg (14px)

---

### 9.14 Citation Overlay (`components/documents/citation-overlay.tsx`)

**Layout:** `space-y-3`
- Each: `rounded-xl border p-3`
- Title in `text-xs font-medium text-[#DC2626]` + page number + ConfidenceBadge
- Content: `text-sm text-[#94A3B8] line-clamp-3`

**Animation:** Staggered slide from right (`opacity + x: 10 → 0`)

---

### 9.15 PDF Viewer (`components/documents/pdf-viewer.tsx`)

**Layout:** `rounded-2xl border bg-[rgba(255,255,255,0.03)] flex flex-col h-full`
- Toolbar: flex, filename + zoom/rotate/download/fullscreen buttons
- Viewport: `bg-[#0a0f1a]`, 800x600 placeholder
- Pagination bar: bottom, centered, disabled states

---

### 9.16 Metric Card (`components/evaluation/metric-card.tsx`)

**Card:** `.glass rounded-2xl p-5`
- Icon badge (rounded-xl p-2) + large percentage
- Label + optional description
- Progress bar: `h-1.5 rounded-full`, animated width fill (0 → N%, 0.8s)

**Hover:** `whileHover={{ y: -2 }}`

---

### 9.17 Comparison Table (`components/evaluation/comparison-table.tsx`)

**Table:** `w-full text-sm`, headers at `text-xs font-medium text-[#94A3B8]`
- Columns: Model, Faithfulness, Relevancy, Precision, Hallucination, Latency
- Score coloring: ≥80% emerald, ≥60% yellow, <60% red
- `font-mono` for numbers, `overflow-x-auto` for mobile

**Animation:** Staggered row slide from left

---

### 9.18 Regression Chart (`components/evaluation/regression-chart.tsx`)

- Legend: Faithfulness (red), Relevancy (blue), Precision (emerald)
- LineChart at 220px height
- Footer: first/last evaluation names

---

### 9.19 Error Boundary (`components/shared/error-boundary.tsx`)

- Catches rendering errors
- Fallback: centered error icon + message + "Try again" button
- Button: `rounded-xl bg-[#DC2626]/15 px-4 py-2 text-sm text-[#DC2626]`

---

### 9.20 Empty State (`components/shared/empty-state.tsx`)

- Centered column, py-16
- 64x64 icon container + title + description + optional action slot

---

### 9.21 Loading Skeleton (`components/shared/loading-skeleton.tsx`)

- Single: `animate-pulse rounded-xl bg-[rgba(255,255,255,0.05)]`
- PageSkeleton: header (title+subtitle) → 4-card responsive grid

---

### 9.22 Particles Background (`components/shared/particles-bg.tsx`)

- Full-screen canvas (`fixed inset-0 z-0`, `pointer-events-none`, `opacity: 0.4`)
- 50 purple particles (`rgba(124, 58, 237, opacity)`)
- Random size (0.5-2.5px), opacity (0.1-0.6), velocity (0-0.3 px/frame)
- `requestAnimationFrame` loop, bounces off edges

---

### 9.23 Theme Provider (`components/layout/theme-provider.tsx`)

- Wrapper around `next-themes` ThemeProvider
- `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`

---

## 10. Responsive Design

### Breakpoints

| Prefix | Min Width | Usage |
|---|---|---|
| (default) | 0px | Mobile-first base |
| `sm:` | 640px | Small tablets — KPI grids 2-col, collection grids 2-col, search text visible, user name visible |
| `md:` | 768px | Tablets — sidebar desktop toggle, settings sidebar, form fields side-by-side, main padding increase |
| `lg:` | 1024px | Desktop — KPI grids 4-col, collection grids 3-col, documents 3-col, agent workflow full width |
| `xl:` | 1280px | Wide screens — playground 2-panel, full dashboard layout |

### Responsive Patterns

| Pattern | Mobile | Desktop |
|---|---|---|
| **Sidebar** | Hidden, slide-in overlay from left | Fixed, 260px wide |
| **KPI Grid** | 1 column | 2 columns (sm) → 4 columns (lg) |
| **Charts** | 1 column | 2 columns (lg) |
| **Settings Tabs** | Horizontal scroll | Left sidebar column |
| **Playground** | Stacked panels | Side-by-side (xl) |
| **Documents Detail** | Stacked | 2:1 grid (lg) |
| **Knowledge Base Grid** | 1 column | 2 (sm) → 3 (lg) columns |
| **Model Comparison** | Stacked | 4-column selection + 2-column results |
| **Embeddings** | Stacked | 3:1 grid (lg) |
| **Main Padding** | `p-4` | `md:p-6` |
| **Chat Container** | Full width | Full remaining width |

---

## 11. State Management

### Zustand Stores

#### Auth Store (persisted in localStorage: `opspilot-auth`)
| Field | Type | Purpose |
|---|---|---|
| `user` | `User \| null` | Current user object |
| `isAuthenticated` | `boolean` | Derived auth flag |
| `setUser(user)` | action | Sets user + derives isAuthenticated |
| `setTokens(access, refresh)` | action | Stores tokens in localStorage |
| `logout()` | action | Clears tokens + user |

#### UI Store (ephemeral)
| Field | Type | Purpose |
|---|---|---|
| `sidebarCollapsed` | `boolean` | Sidebar expand/collapse state |
| `commandPaletteOpen` | `boolean` | Cmd+K palette visibility |
| `toggleSidebar()` | action | Flips sidebar state |
| `setCommandPaletteOpen(open)` | action | Sets palette state |

### Hooks

| Hook | Purpose | Returns |
|---|---|---|
| `useAuth` | Auth state + sign out | `user`, `isAuthenticated`, `setUser`, `setTokens`, `signOut` |
| `useStreamingChat` | SSE chat streaming | `sendMessage(msg, convId?)`, `stop()` |
| `useCommandPalette` | Cmd+K palette state | `open`, `setOpen`, `openPalette` |

### Theme Settings (localStorage: `opspilot-settings`)
| Key | Values |
|---|---|
| Theme | `dark`, `midnight`, `oled` |
| Accent Color | Red, Blue, Emerald, Amber, Red, Pink |
| Sidebar Compact | `boolean` |

---

## 12. Navigation & Routing

### Route Map

| Route | Page | Layout |
|---|---|---|
| `/` | Redirect → `/dashboard/chat` | Root |
| `/login` | Login form | Root |
| `/register` | Registration form | Root |
| `/chat` | Redirect → `/dashboard/chat` | Root |
| `/dashboard` | KPI dashboard with charts | Dashboard (Sidebar + Navbar) |
| `/dashboard/chat` | AI chat with document upload | Dashboard |
| `/dashboard/analytics` | Usage/cost/latency analytics | Dashboard |
| `/dashboard/settings` | 5-tab settings | Dashboard |
| `/dashboard/documents` | Document list + PDF viewer | Dashboard |
| `/dashboard/cost-estimator` | Model cost calculator | Dashboard |
| `/dashboard/agents` | Agent pipeline visualization | Dashboard |
| `/dashboard/knowledge-base` | Collection management + upload | Dashboard |
| `/dashboard/integrations` | Connected/available integrations | Dashboard |
| `/dashboard/model-comparison` | Side-by-side LLM benchmark | Dashboard |
| `/dashboard/playground` | Prompt testing sandbox | Dashboard |
| `/dashboard/evaluation` | RAG quality metrics | Dashboard |
| `/dashboard/embeddings` | 2D embedding visualization | Dashboard |

### Sidebar Navigation Order
1. Dashboard
2. Knowledge Base
3. Documents
4. Chat
5. Agents
6. Analytics
7. Evaluation
8. Playground
9. Model Comparison
10. Cost Estimator
11. Embeddings
12. Integrations
13. Settings

### Active Route Detection
- Exact match: `pathname === item.href`
- Sub-route match: `pathname.startsWith(item.href)` (e.g., `/dashboard/chat` matches `/dashboard`)
- Active indicator: animated red dot with `layoutId` shared layout animation

---

## Appendix: All Lucide React Icons Used (45+ unique)

Play, CheckCircle, AlertCircle, Clock, ChevronDown, ChevronRight, ChevronLeft, Cpu, Zap, Loader2, Upload, FileText, X, MoreVertical, Database, Trash2, LayoutDashboard, MessageSquare, Bot, BarChart3, Plug, Settings, Sparkles, FlaskConical, Layers, DollarSign, Network, Search, Command, Menu, Moon, Sun, Monitor, Bell, ArrowRight, ZoomIn, ZoomOut, RotateCw, Download, Maximize2, Eye, EyeOff, User, Key, Shield, Palette, RefreshCw, Info, Target, AlertTriangle, Brain, Timer, Activity, Folder, Plus, RotateCcw, BookOpen, Copy, GitBranch, Hash, Globe
