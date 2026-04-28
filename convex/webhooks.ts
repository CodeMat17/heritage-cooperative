import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Called only by the Next.js Squad webhook route after HMAC verification.
// The webhookSecret arg prevents arbitrary clients from triggering this action.
export const processSquadPayment = action({
  args: {
    webhookSecret: v.string(),
    transactionRef: v.string(),
    email: v.string(),
    amount: v.number(),
    merchantAmount: v.number(),
    currency: v.string(),
    transactionStatus: v.string(),
    transactionType: v.string(),
    gatewayRef: v.optional(v.string()),
    paymentType: v.optional(v.string()),
    cardType: v.optional(v.string()),
    pan: v.optional(v.string()),
    tokenId: v.optional(v.string()),
    customerMobile: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    meta: v.optional(v.any()),
    merchantId: v.optional(v.string()),
    squadCreatedAt: v.string(),
  },
  handler: async (ctx, args): Promise<
    | { status: "already_processed" }
    | { status: "user_not_found" }
    | { status: "success"; contributionId: string }
  > => {
    if (args.webhookSecret !== process.env.CONVEX_WEBHOOK_SECRET) {
      throw new Error("Unauthorized");
    }
    // Idempotency check
    const existing = await ctx.runQuery(internal.userContributions.getByTransactionRef, {
      transactionRef: args.transactionRef,
    });
    if (existing) return { status: "already_processed" as const };

    const user = await ctx.runQuery(internal.users.getByEmail, { email: args.email });
    if (!user) return { status: "user_not_found" as const };

    const contributionId = await ctx.runMutation(internal.userContributions.create, {
      clerkUserId: user.clerkUserId,
      fullName: user.fullName,
      email: args.email,
      transactionRef: args.transactionRef,
      gatewayRef: args.gatewayRef,
      amount: args.amount,
      merchantAmount: args.merchantAmount,
      currency: args.currency,
      transactionStatus: args.transactionStatus,
      transactionType: args.transactionType,
      paymentType: args.paymentType,
      cardType: args.cardType,
      pan: args.pan,
      tokenId: args.tokenId,
      customerMobile: args.customerMobile,
      isRecurring: args.isRecurring,
      meta: args.meta,
      merchantId: args.merchantId,
      squadCreatedAt: args.squadCreatedAt,
      processedAt: Date.now(),
      isProcessed: true,
      processingNotes: "Webhook processed successfully",
    });

    await ctx.runMutation(internal.users.updateTotalContribution, {
      clerkUserId: user.clerkUserId,
      amountKobo: args.amount,
    });

    return { status: "success" as const, contributionId };
  },
});
