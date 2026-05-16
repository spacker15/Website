export const siteConfig = {
  name: "Creek's Girls Lacrosse",
  shortName: "Creek's Girls Lax",
  description:
    "Official site of the Creek's Girls Lacrosse team — schedules, rosters, news, registration, and ways to support the program.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://creeksgirlslacrosse.com",
  contactEmail: "creeksgirlslacross@gmail.com",
  socials: {
    instagram: {
      handle: "@creeksgirlslacrosse",
      url: "https://instagram.com/creeksgirlslacrosse",
    },
    facebook: {
      handle: "Creeks Girls Lacrosse",
      url: "https://www.facebook.com/",
    },
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "News", href: "/news" },
    { label: "Sponsors", href: "/sponsors" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
