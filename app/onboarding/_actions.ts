"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export const completeOnboarding = async (_formData: FormData) => {
  const { userId } = await auth();

  if (!userId) {
    return { message: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });
    // Upsert user in Convex as part of onboarding; other fields will be inserted on the client
    // Do not upsert here; the client will send the full, required payload after success
    return { message: res.publicMetadata };
  } catch (err) {
    console.log("Error Msg: ", err);
    return { error: "There was an error updating your metadata." };
  }
};
