import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata?.role as string | undefined;
  const isAdmin = role === "admin";

  // Sync the Clerk role into the Convex users table so DB-based admin checks work.
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });
    if (token) {
      await fetchMutation(api.users.syncRole, { role }, { token });
    }
  } catch {
    // Non-fatal — user may not be onboarded yet or Convex may be unreachable.
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav isAdmin={isAdmin} />

      {/* ── Main Content ── */}
      <main className="lg:pl-60 pb-20 lg:pb-0 min-h-screen">{children}</main>
    </div>
  );
}
