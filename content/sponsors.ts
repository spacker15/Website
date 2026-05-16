export type SponsorTier = "hat-trick" | "top-shelf" | "sauce" | "ground-ball";

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
    id: "hat-trick",
    name: "Hat Trick",
    amount: "$1,500+",
    tagline: "Three goals' worth of impact — our premier tier.",
    benefits: [
      "Tall feather flag with your logo displayed at all home games",
      "Featured placement (large logo + link) on the sponsors page",
      "Dedicated post and story on Instagram and Facebook",
      "Recognition in the season-end thank-you newsletter",
    ],
  },
  {
    id: "top-shelf",
    name: "Top Shelf",
    amount: "$750",
    tagline: "Premium placement, top-corner visibility.",
    benefits: [
      "Logo on the sponsors page with link to your business",
      "Social media shout-out (Instagram + Facebook)",
      "Mid-season recognition newsletter mention",
    ],
  },
  {
    id: "sauce",
    name: "Sauce",
    amount: "$400",
    tagline: "Slick support that keeps the team moving.",
    benefits: [
      "Logo on the sponsors page",
      "Social media shout-out",
    ],
  },
  {
    id: "ground-ball",
    name: "Ground Ball",
    amount: "$150",
    tagline: "Every possession counts — small but mighty.",
    benefits: [
      "Name listed on the sponsors page",
      "Thank-you in the season-end newsletter",
    ],
  },
];
