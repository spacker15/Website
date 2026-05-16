// TODO: replace placeholders with the team's real sponsors. Update logo,
// url, and description for each — and add `logo` paths under public/sponsors.

export type SponsorTier = "platinum" | "gold" | "silver" | "supporter";

export type Sponsor = {
  name: string;
  tier: SponsorTier;
  url?: string;
  logo?: string;
  description?: string;
};

export const sponsors: Sponsor[] = [
  {
    name: "Sponsor Name — Platinum",
    tier: "platinum",
    description:
      "Placeholder. Add a short blurb about the sponsor and a link to their site.",
  },
  {
    name: "Sponsor Name — Gold",
    tier: "gold",
    description: "Placeholder sponsor description.",
  },
  {
    name: "Sponsor Name — Gold",
    tier: "gold",
    description: "Placeholder sponsor description.",
  },
  {
    name: "Sponsor Name — Silver",
    tier: "silver",
    description: "Placeholder sponsor description.",
  },
];
