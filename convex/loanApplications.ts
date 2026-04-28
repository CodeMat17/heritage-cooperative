import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function jwtRole(identity: Record<string, unknown>): string | undefined {
  return identity.role as string | undefined;
}

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

    if (args.loanAmount <= 0) throw new Error("Loan amount must be positive");
    if (args.monthlyIncome < 0) throw new Error("Monthly income cannot be negative");
    const validPeriods = [3, 6, 9, 12];
    if (!validPeriods.includes(args.repaymentPeriod)) throw new Error("Repayment period must be 3, 6, 9, or 12 months");

    const TIER_MAX: Record<string, number> = {
      bronze: 100_000,
      silver: 180_000,
      gold: 360_000,
      diamond: 1_000_000,
      emerald: 2_000_000,
    };

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user)
      throw new Error("User profile not found. Complete onboarding first.");

    const tierMax = user.tier ? (TIER_MAX[user.tier] ?? 0) : 0;
    if (args.loanAmount > tierMax) throw new Error(`Loan amount exceeds maximum for your package (${tierMax})`);

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
    if (jwtRole(identity as Record<string, unknown>) !== "admin") return [];

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
    const isAdmin = jwtRole(identity as Record<string, unknown>) === "admin";
    const application = await ctx.db.get(id);
    // Users may only view their own application; admins may view any
    if (!isAdmin && application?.clerkUserId !== identity.subject) throw new Error("Forbidden");
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
    const validStatuses = ["pending", "approved", "rejected", "repaid"];
    if (!validStatuses.includes(status)) throw new Error("Invalid status value");
    const loan = await ctx.db.get(id);
    await ctx.db.patch(id, {
      status,
      reviewedAt: Date.now(),
      reviewedBy: identity.subject,
      reviewNotes,
    });

    // When a loan is marked repaid, unlock package selection for the borrower
    if (status === "repaid" && loan) {
      const borrower = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", loan.clerkUserId))
        .unique();
      if (borrower) {
        await ctx.db.patch(borrower._id, { canSelectPackage: true });
      }
    }
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
