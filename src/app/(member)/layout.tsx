import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader signedIn />
      <div className="border-b border-neutral-200 bg-surface-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
          <nav className="flex flex-wrap gap-1 text-sm" aria-label="Member">
            <Tab href="/dashboard">Dashboard</Tab>
            <Tab href="/profile">Profile</Tab>
            {user.roles.includes("head_coach") && (
              <Tab href="/manage/teams">Manage teams</Tab>
            )}
          </nav>
          <span className="ml-auto text-xs text-ink-muted">
            {user.email}
            {user.roles.length > 0 && (
              <> · {user.roles.map(formatRole).join(", ")}</>
            )}
          </span>
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 font-medium text-ink-muted hover:bg-white hover:text-brand-teal-700"
    >
      {children}
    </Link>
  );
}

function formatRole(role: string) {
  return role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
