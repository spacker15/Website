import { requireProgramLeader } from "@/lib/auth";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProgramLeader();
  return <>{children}</>;
}
