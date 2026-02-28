# Theming System Plan — BérAutó

## Current State

- **Tailwind v4** with CSS-based config (`@theme inline` in `globals.css`)
- **shadcn/ui** `new-york` style, `neutral` base, `oklch()` color space
- Dark mode CSS variables exist in `.dark` selector but **nothing toggles them**
- No `next-themes`, no `ThemeProvider`, no toggle UI, no `suppressHydrationWarning`
- Color palette is entirely neutral/grayscale (no brand color)
- Headers are duplicated inline across 6 files (root page, auth layout, public car detail, dashboard layout, agent layout, admin layout)

## Goal

Consistent theming system with:
- Green-based brand palette for both light and dark modes
- System-preference-aware dark mode with manual override
- Global theme toggle visible on all pages

---

## Phase 1: Infrastructure (next-themes + ThemeProvider)

### 1.1 Install `next-themes`

```bash
pnpm add next-themes
```

### 1.2 Create `src/components/shared/theme-provider.tsx`

A thin `"use client"` wrapper around `next-themes`' `ThemeProvider`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### 1.3 Update `src/app/layout.tsx`

- Add `suppressHydrationWarning` to `<html>` (required by `next-themes` to avoid hydration mismatch)
- Wrap children with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`

```tsx
<html lang="hu" suppressHydrationWarning>
  <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>
```

---

## Phase 2: Green-Based Color Palette

### 2.1 Design Rationale

- **Primary**: Professional green (`oklch` hue ~155) — used for buttons, links, active states
- **Accent**: Subtle green tint for hover/highlight backgrounds
- **Ring**: Green-tinged focus ring for accessibility
- **Backgrounds/text/cards/borders**: Stay neutral gray for readability and professional appearance
- **Destructive**: Keep red (unchanged)
- **Chart colors**: Harmonized 5-color palette that works with the green brand
- **Sidebar**: Green-branded primary for active sidebar items

### 2.2 Update `globals.css` `:root` and `.dark` blocks

Replace the current neutral primary/accent/ring values with green-based alternatives:

#### Light Mode (`:root`)

| Token | Current | New | Rationale |
|-------|---------|-----|-----------|
| `--primary` | `oklch(0.205 0 0)` (near-black) | `oklch(0.45 0.16 155)` (rich green) | Brand primary |
| `--primary-foreground` | `oklch(0.985 0 0)` (white) | `oklch(0.985 0 0)` (white) | No change — white on green has good contrast |
| `--accent` | `oklch(0.97 0 0)` (gray) | `oklch(0.96 0.02 155)` (very subtle green tint) | Slight green warmth on hover states |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.25 0.05 155)` (dark green-black) | Harmonized with accent bg |
| `--ring` | `oklch(0.708 0 0)` (gray) | `oklch(0.55 0.14 155)` (mid green) | Green focus rings |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.45 0.16 155)` (same as primary) | Consistent with brand |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | No change |
| `--chart-1` through `--chart-5` | Various | Harmonized palette anchored on green | Visual consistency |

All other tokens (`--background`, `--foreground`, `--card`, `--secondary`, `--muted`, `--border`, `--input`, `--destructive`, `--popover`, `--sidebar-*`) remain neutral/unchanged.

#### Dark Mode (`.dark`)

| Token | Current | New | Rationale |
|-------|---------|-----|-----------|
| `--primary` | `oklch(0.922 0 0)` (light gray) | `oklch(0.65 0.18 155)` (vibrant green) | Readable green on dark bg |
| `--primary-foreground` | `oklch(0.205 0 0)` | `oklch(0.145 0.03 155)` (near-black, green tint) | Good contrast with lighter primary |
| `--accent` | `oklch(0.269 0 0)` | `oklch(0.27 0.03 155)` (dark with green tint) | Subtle green warmth |
| `--accent-foreground` | `oklch(0.985 0 0)` | `oklch(0.95 0.02 155)` (off-white, warm) | Harmonized |
| `--ring` | `oklch(0.556 0 0)` | `oklch(0.55 0.14 155)` (mid green) | Green focus rings |
| `--sidebar-primary` | `oklch(0.488 0.243 264.376)` (blue) | `oklch(0.65 0.18 155)` (same as primary) | Remove blue, use brand green |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.145 0.03 155)` | Match primary-foreground |
| `--chart-1` through `--chart-5` | Various (incl. blue) | Harmonized dark-mode palette | Visual consistency |

### 2.3 Also register any new tokens in `@theme inline`

If new CSS variable names are introduced (e.g., `--success`), they must be registered in the `@theme inline` block. For this plan, we are only modifying existing token values, so no new registrations are needed.

---

## Phase 3: Theme Toggle UI

### 3.1 Install required shadcn components

```bash
pnpm dlx shadcn@latest add dropdown-menu
```

This will also pull in any Radix UI dependencies it needs.

### 3.2 Create `src/components/shared/theme-toggle.tsx`

A `"use client"` component using `next-themes`' `useTheme()` hook:

```tsx
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 3.3 Add `<ThemeToggle />` to all existing headers

The toggle will be inserted into each of these 6 locations, placed in the header's right-side actions area (before sign-out buttons where applicable):

| File | Location |
|------|----------|
| `src/app/page.tsx` | Home page header, next to Login/Register buttons |
| `src/app/(auth)/layout.tsx` | Auth header, next to "Back to Home" button |
| `src/app/(public)/cars/[id]/page.tsx` | Car detail header, next to Login/Register buttons |
| `src/app/dashboard/layout.tsx` | Dashboard header, before Sign Out button |
| `src/app/agent/layout.tsx` | Agent header, before Sign Out button |
| `src/app/admin/layout.tsx` | Admin header, before Sign Out button |

---

## Files Changed Summary

| File | Action |
|------|--------|
| `package.json` | `next-themes` added as dependency |
| `src/components/shared/theme-provider.tsx` | **New** — ThemeProvider wrapper |
| `src/components/shared/theme-toggle.tsx` | **New** — Theme toggle dropdown |
| `src/components/ui/dropdown-menu.tsx` | **New** (via `shadcn add`) — Radix dropdown primitives |
| `src/app/globals.css` | Modified — Green-based oklch color values |
| `src/app/layout.tsx` | Modified — `suppressHydrationWarning` + ThemeProvider |
| `src/app/page.tsx` | Modified — Add ThemeToggle |
| `src/app/(auth)/layout.tsx` | Modified — Add ThemeToggle |
| `src/app/(public)/cars/[id]/page.tsx` | Modified — Add ThemeToggle |
| `src/app/dashboard/layout.tsx` | Modified — Add ThemeToggle |
| `src/app/agent/layout.tsx` | Modified — Add ThemeToggle |
| `src/app/admin/layout.tsx` | Modified — Add ThemeToggle |

---

## Verification

After implementation:
1. `pnpm build` — must pass with no errors
2. `pnpm typecheck` — no type errors
3. `pnpm lint` — no lint errors
4. Visual check: toggle between light/dark/system on each page, confirm green branding is consistent
