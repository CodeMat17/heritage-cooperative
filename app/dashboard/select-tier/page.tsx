import { api } from "@/convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import SelectTierClient from "./SelectTierClient";

export default async function SelectCategory() {
  const user = await currentUser();
  if (!user) redirect("/dashboard");
  // Fetch Convex user to check tier
  const me = await fetchQuery(api.users.getByClerkId, { clerkUserId: user.id });
  if (me?.tier) redirect("/dashboard");
  return <SelectTierClient />;
}
