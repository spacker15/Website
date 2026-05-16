export type SponsorTier = "platinum" | "gold" | "silver" | "supporter";

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
    id: "platinum",
    name: "Platinum",
    amount: "$1,500+",
    tagline: "Our top tier — most visibility, biggest impact.",
    benefits: [
      "Logo on team warm-up shirts or banner at home games",
      "Featured placement (large logo + link) on the sponsors page",
      "Dedicated post and story on Instagram and Facebook",
      "Recognition in season-end thank-you newsletter",
      "Two complimentary tickets to the end-of-season banquet",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    amount: "$750",
    tagline: "Strong visibility across the season.",
    benefits: [
      "Logo on the sponsors page with link to your business",
      "Social media shout-out (Instagram + Facebook)",
      "Mid-season recognition newsletter mention",
      "Recognition at the end-of-season banquet",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    amount: "$400",
    tagline: "Show your support and reach our community.",
    benefits: [
      "Logo on the sponsors page",
      "Social media shout-out",
      "Recognition at the end-of-season banquet",
    ],
  },
  {
    id: "supporter",
    name: "Supporter",
    amount: "$150",
    tagline: "For local families and small businesses who want to chip in.",
    benefits: [
      "Name listed on the sponsors page",
      "Thank-you in season-end newsletter",
    ],
  },
];
