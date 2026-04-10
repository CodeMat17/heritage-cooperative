import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const isAdmin = user.publicMetadata?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav isAdmin={isAdmin} />
      <main className="lg:pl-60 pb-20 lg:pb-0 min-h-screen">{children}</main>
    </div>
  );
}
