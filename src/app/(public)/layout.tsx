import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getSessionUser } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader signedIn={!!user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
