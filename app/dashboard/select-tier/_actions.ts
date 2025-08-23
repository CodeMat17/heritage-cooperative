"use server";

import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export async function setTierFromForm(formData: FormData): Promise<void> {
  const tierId = String(formData.get("tierId") || "");
  if (!tierId) return;
  const { userId } = await auth();
  if (!userId) return;

  // Update Convex user document only
  await fetchMutation(api.users.setUserTier, { tier: tierId });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
