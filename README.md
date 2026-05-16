# Creek's Girls Lacrosse

Official team website. Replaces TeamSnap for rosters, events, registration, and communications.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Deploys to Vercel

Future phases add Supabase (Auth + Postgres + Storage), Stripe Checkout,
nodemailer + Gmail SMTP, shadcn/ui, react-hook-form + zod, and a LeagueApps
roster sync.

## Development

Requires Node 22+ and pnpm 10+.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
```
