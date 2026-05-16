"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Home" className="flex items-center">
          <Logo variant="wordmark" height={40} priority />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-brand-teal-50 hover:text-brand-teal-700"
            >
              {item.label}
            </Link>
          ))}
          <span className="mx-1 h-5 w-px bg-neutral-300" aria-hidden />
          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-brand-teal-700 hover:bg-brand-teal-50"
              >
                Dashboard
              </Link>
              <Link
                href="/logout"
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted"
              >
                Sign out
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-brand-teal-700 hover:bg-brand-teal-50"
            >
              Sign in
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-surface-muted md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-neutral-200 md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6"
          aria-label="Mobile"
        >
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-brand-teal-50 hover:text-brand-teal-700"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-neutral-200" />
          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium text-brand-teal-700"
              >
                Dashboard
              </Link>
              <Link
                href="/logout"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium text-ink-muted"
              >
                Sign out
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-brand-teal-700"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
