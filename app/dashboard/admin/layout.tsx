import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has admin role
  const userRole = user?.publicMetadata?.role as string;
  if (userRole !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
