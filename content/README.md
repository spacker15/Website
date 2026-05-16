# Content files

These JSON files drive content on the website. Edit them directly here on
GitHub (pencil icon → make changes → commit), and Vercel will redeploy the
site within a minute or two.

## `sponsorship-tiers.json`

Defines the sponsorship packages shown on `/sponsors`. Each entry has:

- `id` — short identifier (lowercase, hyphens; e.g. `hat-trick`). No spaces.
- `name` — display name shown on the page.
- `amount` — dollar amount string (e.g. `$1,500+`).
- `tagline` — one-line description shown under the amount.
- `benefits` — list of bullet points shown in the tier card.

You can add new tiers, remove existing ones, or reorder them. The order in
the file is the order shown on the site.

## `sponsors.json`

The list of confirmed sponsors. While the file is `[]` (empty), the page
shows the "be the first to sponsor" pitch. Once entries are added, a
"Thank you to our current sponsors" section appears below the packages.

Each sponsor entry:

- `name` — business or family name.
- `tier` — must match an `id` from `sponsorship-tiers.json`.
- `url` (optional) — website link. Include `https://` at the start.
- `description` (optional) — short blurb about the sponsor.
- `logo` (optional) — path to a logo image in `public/sponsors/`
  (e.g. `/sponsors/acme.png`).

## `news/*.mdx`

News posts shown at `/news` and `/news/<slug>`. Frontmatter (top of file
between `---` lines) sets the title, slug, date, excerpt, and author. The
body below is regular Markdown. Add a new file to publish a new post; the
list auto-updates.
