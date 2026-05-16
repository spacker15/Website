# Creek's Girls Lacrosse

Official team website. Replaces TeamSnap for rosters, events, registration, and communications.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** + `@tailwindcss/typography`
- **react-hook-form** + **zod** for forms and validation
- **nodemailer** + Gmail SMTP for transactional email
- **sonner** for toasts, **lucide-react** for icons
- **next-mdx-remote** for MDX-backed news posts (until Phase 6 moves news to the database)
- Deploys to **Vercel**

Future phases add Supabase (Auth + Postgres + Storage), shadcn/ui, Stripe Checkout, and a LeagueApps roster sync.

## Development

Requires Node 22+ and pnpm 10+.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
```

Copy `.env.example` to `.env.local` and fill in values before running locally.

## Structure

```
src/
  app/
    layout.tsx                   root layout (fonts, metadata, Toaster)
    globals.css                  Tailwind v4 + brand tokens
    sitemap.ts                   /sitemap.xml
    robots.ts                    /robots.txt
    icon.tsx                     generated favicon
    opengraph-image.tsx          default OG card
    (public)/                    marketing routes (header + footer layout)
      layout.tsx
      page.tsx                   home
      about/page.tsx
      news/
        page.tsx                 index
        [slug]/page.tsx          single post
      sponsors/page.tsx
      contact/
        page.tsx
        contact-form.tsx         RHF + zod form
        actions.ts               server action → nodemailer
        schema.ts
  components/
    layout/                      site-header, site-footer, wordmark
    ui/                          button, input, textarea, label, field
  lib/
    site-config.ts
    utils.ts                     cn()
    rate-limit.ts                in-memory bucket
    mdx.ts                       reads content/news/*.mdx
    email/send-mail.ts           nodemailer transport singleton
content/
  news/*.mdx                     seed news posts (replace before launch)
  sponsors.ts                    sponsor list (replace placeholders)
```

## Environment variables

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (used in sitemap, OG, robots). |
| `GMAIL_USER` | Gmail address for the contact form sender. |
| `GMAIL_APP_PASSWORD` | Gmail [App Password](https://myaccount.google.com/apppasswords) (not the main password). |

Without Gmail creds the contact form returns a clear "email not configured" error to users.

## Branding

Brand tokens are defined in `src/app/globals.css` under `@theme`. Adjust the
`--color-brand-*` values to update the palette site-wide.

Logo, hero photo, sponsor logos, About copy, and news posts are placeholders
marked with `TODO` comments — replace before launch.
