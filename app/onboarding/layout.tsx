import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const onboardingComplete = Boolean(
    (user.publicMetadata as { onboardingComplete?: boolean } | undefined)
      ?.onboardingComplete
  );

  if (!onboardingComplete) return <>{children}</>;

  // onboardingComplete = true but user arrived at /onboarding.
  // This happens when Convex profile is missing (data loss). Check the referer —
  // if they came from /dashboard, reset the flag so they can re-fill the form.
  const headersList = await headers();
  const referer = headersList.get("referer") ?? "";
  const comingFromDashboard = referer.includes("/dashboard");

  if (comingFromDashboard) {
    const client = await clerkClient();
    await client.users.updateUser(user.id, {
      publicMetadata: { onboardingComplete: false },
    });
    return <>{children}</>;
  }

  redirect("/dashboard");
}
