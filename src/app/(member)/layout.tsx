import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, isProgramLeader, managesAnyTeam } from "@/lib/auth";
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
            {managesAnyTeam(user) && <Tab href="/manage/teams">Manage teams</Tab>}
            {isProgramLeader(user) && <Tab href="/manage/registration">Registration</Tab>}
            {isProgramLeader(user) && <Tab href="/manage/people">People</Tab>}
          </nav>
          <span className="ml-auto text-xs text-ink-muted">
            {user.email}
            {user.roles.length > 0 && (
              <> · {summarizeRoles(user.roles)}</>
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

function summarizeRoles(roles: { role: string; teamId: string | null }[]): string {
  const unique = Array.from(new Set(roles.map((r) => r.role)));
  return unique
    .map((r) => r.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(", ");
}
