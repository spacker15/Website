import { requireRole } from "@/lib/auth";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("head_coach");
  return <>{children}</>;
}
