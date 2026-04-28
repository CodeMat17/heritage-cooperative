import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

function jwtRole(identity: Record<string, unknown>): string | undefined {
  return identity.role as string | undefined;
}

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

// Syncs the role from the Clerk JWT session claim into the DB.
// No client-supplied role — the value comes exclusively from the verified JWT.
export const syncRole = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const role = jwtRole(identity as Record<string, unknown>);
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
    await ctx.db.patch(existing._id, {
      tier,
      tierStartDate: new Date().toISOString().split("T")[0],
      canSelectPackage: undefined,
    });
  },
});

// User confirms they want to continue with their current package (after loan repayment)
export const confirmContinuePackage = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!user) throw new Error("User profile not found.");
    await ctx.db.patch(user._id, { canSelectPackage: undefined });
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const isAdmin = jwtRole(identity as Record<string, unknown>) === "admin";
    if (!isAdmin && identity.subject !== clerkUserId) throw new Error("Forbidden");
    return await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    if (jwtRole(identity as Record<string, unknown>) !== "admin") return null;
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
    if (jwtRole(identity as Record<string, unknown>) !== "admin") throw new Error("Forbidden");
    return await ctx.db.get(id);
  },
});

// Internal — called only from the Squad webhook Convex action
export const getByEmail = internalQuery({
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

// Internal — called only from the Squad webhook Convex action.
// Accepts the contribution amount in kobo and adds it to the current DB total
// atomically, so retried actions cannot double-count.
export const updateTotalContribution = internalMutation({
  args: {
    clerkUserId: v.string(),
    amountKobo: v.number(),
  },
  handler: async (ctx, { clerkUserId, amountKobo }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, {
      totalContributed: (user.totalContributed ?? 0) + amountKobo / 100,
    });
  },
});
