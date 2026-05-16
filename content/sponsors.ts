export type SponsorTier = "captain" | "attack" | "midfield" | "ground-ball";

export type Sponsor = {
  name: string;
  tier: SponsorTier;
  url?: string;
  logo?: string;
  description?: string;
};

/**
 * Current confirmed sponsors. Add new entries as sponsors come on board.
 * Empty array shows the "be the first to sponsor" state on /sponsors.
 */
export const sponsors: Sponsor[] = [];

export type SponsorshipTier = {
  id: SponsorTier;
  name: string;
  /** Suggested annual amount — adjust to match what the program decides. */
  amount: string;
  tagline: string;
  benefits: string[];
};

/**
 * Sponsorship packages shown on /sponsors. These are starting-point
 * recommendations — edit amounts and benefits to match what the program
 * is ready to offer.
 */
export const sponsorshipTiers: SponsorshipTier[] = [
  {
    id: "captain",
    name: "Captain",
    amount: "$1,500+",
    tagline: "Lead the way — our top tier with the most visibility.",
    benefits: [
      "Logo on team warm-up shirts or banner at home games",
      "Tall feather flag with your logo displayed at all home games",
      "Featured placement (large logo + link) on the sponsors page",
      "Dedicated post and story on Instagram and Facebook",
      "Recognition in the season-end thank-you newsletter",
    ],
  },
  {
    id: "attack",
    name: "Attack",
    amount: "$750",
    tagline: "Strong visibility on offense across the season.",
    benefits: [
      "Logo on the sponsors page with link to your business",
      "Social media shout-out (Instagram + Facebook)",
      "Mid-season recognition newsletter mention",
    ],
  },
  {
    id: "midfield",
    name: "Midfield",
    amount: "$400",
    tagline: "Two-way support — show up for the team.",
    benefits: [
      "Logo on the sponsors page",
      "Social media shout-out",
    ],
  },
  {
    id: "ground-ball",
    name: "Ground Ball",
    amount: "$150",
    tagline: "Every possession counts — for families and small businesses chipping in.",
    benefits: [
      "Name listed on the sponsors page",
      "Thank-you in the season-end newsletter",
    ],
  },
];
