import { ConvexHttpClient } from "convex/browser";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Read raw body text for signature verification
    const rawBody = await request.text();

    // Verify Squad webhook signature (HMAC-SHA512)
    const signature = request.headers.get("x-squad-encrypted-body");
    if (!signature) {
      console.error("Squad webhook: missing x-squad-encrypted-body header");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const secretKey = process.env.SQUAD_SECRET_KEY;
    if (!secretKey) {
      console.error("Squad webhook: SQUAD_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const expected = createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");
    const signatureValid =
      sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);

    if (!signatureValid) {
      console.error("Squad webhook: signature mismatch — request rejected");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Validate the webhook structure
    if (!body.Event || !body.TransactionRef || !body.Body) {
      console.error("Invalid webhook structure");
      return NextResponse.json(
        { error: "Invalid webhook structure" },
        { status: 400 }
      );
    }

    // Only process successful charges
    if (body.Event !== "charge_successful") {
      console.log(`Ignoring event: ${body.Event}`);
      return NextResponse.json({ status: "ignored" });
    }

    const transactionData = body.Body;

    // Check if transaction already exists to prevent double processing
    const existingTransaction = await convex.query(
      api.userContributions.getByTransactionRef,
      {
        transactionRef: body.TransactionRef,
      }
    );

    if (existingTransaction) {
      return NextResponse.json({ status: "already_processed" });
    }

    // Find user by email
    const user = await convex.query(api.users.getByEmail, {
      email: transactionData.email,
    });

    if (!user) {
      console.error(`User not found for email: ${transactionData.email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract payment information
    const paymentInfo = transactionData.payment_information || {};

    // Create contribution record
    const contributionData = {
      clerkUserId: user.clerkUserId,
      fullName: user.fullName,
      email: transactionData.email,
      transactionRef: body.TransactionRef,
      gatewayRef: transactionData.gateway_ref ?? undefined,
      amount: transactionData.amount,
      merchantAmount: transactionData.merchant_amount ?? transactionData.amount,
      currency: transactionData.currency ?? "NGN",
      transactionStatus: transactionData.transaction_status ?? "unknown",
      transactionType: transactionData.transaction_type ?? "unknown",
      paymentType: paymentInfo.payment_type ?? undefined,
      cardType: paymentInfo.card_type ?? undefined,
      pan: paymentInfo.pan ?? undefined,
      tokenId: paymentInfo.token_id ?? undefined,
      customerMobile: transactionData.customer_mobile ?? undefined,
      isRecurring: transactionData.is_recurring ?? undefined,
      meta: transactionData.metadata ?? transactionData.meta ?? undefined,
      merchantId: transactionData.merchant_id ?? undefined,
      squadCreatedAt: transactionData.created_at ?? new Date().toISOString(),
      processedAt: Date.now(),
      isProcessed: true,
      processingNotes: "Webhook processed successfully",
    };

    // Insert into userContributions table
    const contributionId = await convex.mutation(
      api.userContributions.create,
      contributionData
    );

    // Update user's total contribution
    const currentTotal = user.totalContributed || 0;
    const newTotal = currentTotal + transactionData.amount / 100; // Convert from kobo to Naira

    await convex.mutation(api.users.updateTotalContribution, {
      clerkUserId: user.clerkUserId,
      totalContributed: newTotal,
    });

    console.log(`Successfully processed contribution: ${contributionId}`);
    console.log(
      `Updated user ${user.fullName} total contribution to: ₦${newTotal}`
    );

    return NextResponse.json({
      status: "success",
      contributionId,
      message: "Contribution recorded successfully",
    });
  } catch (error) {
    console.error("Error processing Squad webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    status: "webhook_endpoint_active",
    message: "Squad webhook endpoint is ready to receive notifications",
  });
}
