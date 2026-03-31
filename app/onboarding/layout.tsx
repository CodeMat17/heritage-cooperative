import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const onboardingComplete = Boolean(
    (user?.publicMetadata as { onboardingComplete?: boolean } | undefined)
      ?.onboardingComplete
  );
  if (onboardingComplete) redirect("/dashboard");

  return <>{children}</>;
}
