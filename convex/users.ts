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
    taxIdentificationNumber: v.string(),
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
    await ctx.db.patch(existing._id, { tier });
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
  args: {
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Check admin role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin privileges required");
    }

    const page = args.page || 1;
    const limit = args.limit || 20;
    const offset = (page - 1) * limit;

    let users = await ctx.db.query("users").collect();

    // Apply search filter if provided
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      users = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.mobilePhoneNumber.includes(searchTerm)
      );
    }

    // Sort by fullName
    users.sort((a, b) => a.fullName.localeCompare(b.fullName));

    // Apply pagination
    const paginatedUsers = users.slice(offset, offset + limit);

    return {
      users: paginatedUsers,
      total: users.length,
      page,
      limit,
      totalPages: Math.ceil(users.length / limit),
    };
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Check admin role
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin privileges required");
    }

    const user = await ctx.db.get(id);
    return user;
  },
});
