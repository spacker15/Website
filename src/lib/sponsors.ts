import { z } from "zod";
import sponsorsData from "../../content/sponsors.json";
import tiersData from "../../content/sponsorship-tiers.json";

const sponsorshipTierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  amount: z.string().min(1),
  tagline: z.string().min(1),
  benefits: z.array(z.string().min(1)).min(1),
});

const sponsorSchema = z.object({
  name: z.string().min(1),
  tier: z.string().min(1),
  url: z.url().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
});

export type SponsorshipTier = z.infer<typeof sponsorshipTierSchema>;
export type Sponsor = z.infer<typeof sponsorSchema>;

/**
 * Parsed at module load. If either content/*.json file is malformed,
 * the build fails with a clear zod error pointing at the bad entry.
 */
export const sponsorshipTiers: SponsorshipTier[] = z
  .array(sponsorshipTierSchema)
  .parse(tiersData);

export const sponsors: Sponsor[] = z.array(sponsorSchema).parse(sponsorsData);

/** Accent gradient classes used on the sponsors page for each tier card. */
const tierAccentMap: Record<string, string> = {
  "hat-trick": "from-brand-purple-500 to-brand-teal-600",
  "top-shelf": "from-brand-pink-500 to-brand-purple-500",
  sauce: "from-brand-teal-500 to-brand-teal-700",
  "ground-ball": "from-brand-teal-600 to-brand-purple-600",
};

const fallbackAccent = "from-brand-teal-600 to-brand-purple-600";

export function tierAccent(id: string): string {
  return tierAccentMap[id] ?? fallbackAccent;
}
