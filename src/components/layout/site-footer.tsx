import Link from "next/link";
import { Mail } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/social-icon";
import { Wordmark } from "@/components/layout/wordmark";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-neutral-200 bg-surface-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Wordmark size="sm" />
          <p className="mt-4 max-w-sm text-sm text-ink-muted">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
            Explore
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-muted hover:text-brand-teal-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
            Connect
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="inline-flex items-center gap-2 text-ink-muted hover:text-brand-teal-700"
              >
                <Mail size={16} aria-hidden /> {siteConfig.contactEmail}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.socials.instagram.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-ink-muted hover:text-brand-pink-700"
              >
                <InstagramIcon width={16} height={16} /> {siteConfig.socials.instagram.handle}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.socials.facebook.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-ink-muted hover:text-brand-purple-700"
              >
                <FacebookIcon width={16} height={16} /> {siteConfig.socials.facebook.handle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-ink-subtle sm:px-6">
          &copy; {year} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
