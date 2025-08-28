import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new user contribution
export const create = mutation({
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
    paymentMonth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("userContributions", args);
  },
});

// Get contribution by transaction reference
export const getByTransactionRef = query({
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

// Get all contributions for a user
export const getByUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userContributions")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .order("desc")
      .collect();
  },
});

// Get all contributions (for admin)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("userContributions").order("desc").collect();
  },
});

// Get contributions by status
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userContributions")
      .withIndex("by_status", (q) => q.eq("transactionStatus", args.status))
      .order("desc")
      .collect();
  },
});

// Get unprocessed contributions
export const getUnprocessed = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("userContributions")
      .withIndex("by_processed", (q) => q.eq("isProcessed", false))
      .collect();
  },
});

// Update contribution processing status
export const updateProcessingStatus = mutation({
  args: {
    id: v.id("userContributions"),
    isProcessed: v.boolean(),
    processingNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      isProcessed: args.isProcessed,
      processingNotes: args.processingNotes,
    });
  },
});
