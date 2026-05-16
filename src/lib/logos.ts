/**
 * Logo assets. Files live in /public/logos/ and are served at /logos/*.
 *
 * To swap a logo: drop a new PNG at the same path (or change `src` here
 * to a new filename). Dimensions are the intrinsic pixel size of the
 * source PNG — used by next/image to compute the aspect ratio.
 */

export const logos = {
  /** Horizontal lockup: C mark + "CREEKS LACROSSE" text. Used in the header. */
  wordmark: {
    src: "/logos/wordmark.png",
    width: 6000,
    height: 1501,
    alt: "Creek's Girls Lacrosse",
  },
  /** Stacked vertical lockup of "CREEKS / LACROSSE" with the C mark. */
  wordmarkStacked: {
    src: "/logos/wordmark-stacked.png",
    width: 3290,
    height: 1894,
    alt: "Creek's Girls Lacrosse",
  },
  /** Full circular crest with crossed sticks and ball. Used in the hero. */
  crest: {
    src: "/logos/crest.png",
    width: 2460,
    height: 2354,
    alt: "Creek's Girls Lacrosse crest",
  },
  /** Standalone C mark. Used as the favicon. */
  mark: {
    src: "/logos/mark.png",
    width: 1598,
    height: 1501,
    alt: "Creek's Girls Lacrosse mark",
  },
} as const;

export type LogoKey = keyof typeof logos;
