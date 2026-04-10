import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upsertUserFromOnboarding = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    gender: v.string(),
    nickName: v.string(),
    motherMaidenName: v.string(),
    dateOfBirth: v.string(),
    placeOfBirth: v.string(),
    nationality: v.string(),
    stateOfOrigin: v.string(),
    lga: v.string(),
    homeTown: v.string(),
    maritalStatus: v.string(),
    mobilePhoneNumber: v.string(),
    otherPhoneNumber: v.optional(v.string()),
    residentialAddress: v.string(),
    permanentAddress: v.string(),
    taxIdentificationNumber: v.optional(v.string()),
    typeOfTrade: v.string(),
    yearsInTrade: v.number(),
    otherTradeOrSkill: v.optional(v.string()),
    meansOfIdentification: v.string(),
    meansOfIdentificationStartDate: v.string(),
    meansOfIdentificationExpiryDate: v.string(),
    educationalBackground: v.string(),
    accountName: v.string(),
    accountNumber: v.string(),
    bankName: v.string(),
    bvn: v.string(),
    nokSurname: v.string(),
    nokFirstName: v.string(),
    nokOtherName: v.string(),
    nokTitle: v.string(),
    nokDateOfBirth: v.string(),
    nokGender: v.string(),
    nokRelationship: v.string(),
    nokPhoneNumber: v.string(),
    nokEmail: v.string(),
    nokHouseAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const clerkUserId = identity.subject;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!existing) {
      const { fullName, email, ...rest } = args;
      await ctx.db.insert("users", {
        clerkUserId,
        fullName,
        email,
        tier: undefined,
        totalContributed: 0, // Initialize with 0
        ...rest,
      });
    } else {
      const { fullName, email, ...rest } = args;
      await ctx.db.patch(existing._id, {
        fullName,
        email,
        ...rest,
      });
    }
  },
});

export const syncRole = mutation({
  args: { role: v.optional(v.string()) },
  handler: async (ctx, { role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!existing) return; // not onboarded yet, nothing to sync
    await ctx.db.patch(existing._id, { role: role ?? undefined });
  },
});

export const setUserTier = mutation({
  args: { tier: v.string() },
  handler: async (ctx, { tier }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const clerkUserId = identity.subject;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!existing) {
      throw new Error("User profile not found. Complete onboarding first.");
    }
    const patch: { tier: string; tierStartDate?: string } = { tier };
    if (!existing.tierStartDate) {
      patch.tierStartDate = new Date().toISOString().split("T")[0];
    }
    await ctx.db.patch(existing._id, patch);
  },
});

// Change package — blocked if a loan is pending or approved
export const changeUserPackage = mutation({
  args: { tier: v.string() },
  handler: async (ctx, { tier }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!user) throw new Error("User profile not found.");

    // Block if any loan is pending or approved (i.e. active)
    const loans = await ctx.db
      .query("loanApplications")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .collect();

    const hasActiveLoan = loans.some(
      (l) => l.status === "pending" || l.status === "approved"
    );
    if (hasActiveLoan) {
      throw new Error(
        "Package cannot be changed while a loan is pending or active. Repay your loan first."
      );
    }

    await ctx.db.patch(user._id, { tier });
  },
});

export const updateTotalContributed = mutation({
  args: { amount: v.number() },
  handler: async (ctx, { amount }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const clerkUserId = identity.subject;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!existing) {
      throw new Error("User profile not found. Complete onboarding first.");
    }
    const currentTotal = existing.totalContributed || 0;
    await ctx.db.patch(existing._id, {
      totalContributed: currentTotal + amount,
    });
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    return user;
  },
});

export const getByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    return user;
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    // Check JWT claim first (set via Clerk JWT template), then fall back to DB role
    const jwtRole = (identity as Record<string, unknown>).role as string | undefined;
    if (jwtRole !== "admin") {
      const caller = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
        .unique();
      if (!caller || caller.role !== "admin") throw new Error("Admin privileges required");
    }

    const users = await ctx.db.query("users").collect();
    users.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return users;
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db.get(id);
    return user;
  },
});

// Get user by email (for webhook processing)
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return (
      (await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique()) ?? null
    );
  },
});

// Update total contribution (for webhook processing)
export const updateTotalContribution = mutation({
  args: {
    clerkUserId: v.string(),
    totalContributed: v.number(),
  },
  handler: async (ctx, { clerkUserId, totalContributed }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { totalContributed });
  },
});
