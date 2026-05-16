import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/social-icon";
import { ContactForm } from "./contact-form";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Creek's Girls Lacrosse — questions, sponsorship, or volunteering.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        Contact
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        Get in touch
      </h1>
      <p className="mt-4 max-w-2xl text-ink-muted">
        Questions about the program, sponsorship, or volunteering? Send us a
        message and we&apos;ll get back to you.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-[2fr_1fr]">
        <ContactForm />

        <aside className="space-y-6">
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
              Email
            </h2>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="mt-2 inline-flex items-center gap-2 text-ink-muted hover:text-brand-teal-700"
            >
              <Mail size={16} aria-hidden /> {siteConfig.contactEmail}
            </a>
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
              Follow us
            </h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <a
                  href={siteConfig.socials.instagram.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-ink-muted hover:text-brand-pink-700"
                >
                  <InstagramIcon width={16} height={16} />{" "}
                  {siteConfig.socials.instagram.handle}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.socials.facebook.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-ink-muted hover:text-brand-purple-700"
                >
                  <FacebookIcon width={16} height={16} />{" "}
                  {siteConfig.socials.facebook.handle}
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
