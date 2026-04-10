import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createLoanApplication = mutation({
  args: {
    loanAmount: v.number(),
    loanPurpose: v.string(),
    repaymentPeriod: v.number(),
    monthlyIncome: v.number(),
    employmentStatus: v.string(),
    employerName: v.optional(v.string()),
    employerAddress: v.optional(v.string()),
    guarantorName: v.string(),
    guarantorPhone: v.string(),
    guarantorAddress: v.string(),
    guarantorRelationship: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user)
      throw new Error("User profile not found. Complete onboarding first.");

    await ctx.db.insert("loanApplications", {
      clerkUserId,
      fullName: user.fullName,
      email: user.email,
      status: "pending",
      submittedAt: Date.now(),
      ...args,
    });
  },
});

export const getAllLoanApplications = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const jwtRole = (identity as Record<string, unknown>).role as string | undefined;
    const role = jwtRole ?? (await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique()
    )?.role;
    if (role !== "admin") return [];

    let applications;
    if (args.status) {
      applications = await ctx.db
        .query("loanApplications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      applications = await ctx.db
        .query("loanApplications")
        .order("desc")
        .collect();
    }

    return applications;
  },
});

export const getLoanApplicationById = query({
  args: { id: v.id("loanApplications") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const application = await ctx.db.get(id);
    return application;
  },
});

export const updateLoanApplicationStatus = mutation({
  args: {
    id: v.id("loanApplications"),
    status: v.string(),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, reviewNotes }) => {
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
    await ctx.db.patch(id, {
      status,
      reviewedAt: Date.now(),
      reviewedBy: identity.subject,
      reviewNotes,
    });
  },
});

export const getUserLoanApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return empty array instead of throwing error when not authenticated
      return [];
    }

    const clerkUserId = identity.subject;
    const applications = await ctx.db
      .query("loanApplications")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .order("desc")
      .collect();

    return applications;
  },
});
