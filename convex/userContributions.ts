import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

function jwtRole(identity: Record<string, unknown>): string | undefined {
  return identity.role as string | undefined;
}

// Internal — called only from the Squad webhook Convex action
export const create = internalMutation({
  args: {
    clerkUserId: v.string(),
    fullName: v.string(),
    email: v.string(),
    transactionRef: v.string(),
    gatewayRef: v.optional(v.string()),
    amount: v.number(),
    merchantAmount: v.number(),
    currency: v.string(),
    transactionStatus: v.string(),
    transactionType: v.string(),
    paymentType: v.optional(v.string()),
    cardType: v.optional(v.string()),
    pan: v.optional(v.string()),
    tokenId: v.optional(v.string()),
    customerMobile: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    meta: v.optional(v.any()),
    merchantId: v.optional(v.string()),
    squadCreatedAt: v.string(),
    processedAt: v.number(),
    isProcessed: v.boolean(),
    processingNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("userContributions", args);
  },
});

// Internal — called only from the Squad webhook Convex action
export const getByTransactionRef = internalQuery({
  args: { transactionRef: v.string() },
  handler: async (ctx, args) => {
    const contributions = await ctx.db
      .query("userContributions")
      .withIndex("by_transactionRef", (q) =>
        q.eq("transactionRef", args.transactionRef)
      )
      .collect();
    return contributions[0] || null;
  },
});

// Returns contributions for a single user. Users may only query their own;
// admins may query any clerkUserId.
export const getByUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const isAdmin = jwtRole(identity as Record<string, unknown>) === "admin";
    if (!isAdmin && identity.subject !== clerkUserId) throw new Error("Forbidden");
    return await ctx.db
      .query("userContributions")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .order("desc")
      .collect();
  },
});

// Admin only
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (jwtRole(identity as Record<string, unknown>) !== "admin") throw new Error("Forbidden");
    return await ctx.db.query("userContributions").order("desc").collect();
  },
});

// Admin only
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (jwtRole(identity as Record<string, unknown>) !== "admin") throw new Error("Forbidden");
    return await ctx.db
      .query("userContributions")
      .withIndex("by_status", (q) => q.eq("transactionStatus", args.status))
      .order("desc")
      .collect();
  },
});

// Admin only
export const getUnprocessed = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (jwtRole(identity as Record<string, unknown>) !== "admin") throw new Error("Forbidden");
    return await ctx.db
      .query("userContributions")
      .withIndex("by_processed", (q) => q.eq("isProcessed", false))
      .collect();
  },
});
