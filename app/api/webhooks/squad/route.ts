import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Get the encrypted body from headers
    const encryptedBody = request.headers.get("x-squad-encrypted-body");

    if (!encryptedBody) {
      console.error("Missing x-squad-encrypted-body header");
      return NextResponse.json(
        { error: "Missing encrypted body" },
        { status: 400 }
      );
    }

    // TODO: Decrypt the body using Squad's encryption key
    // For now, we'll parse the raw body (you'll need to implement decryption)
    const body = await request.json();

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
      gatewayRef: transactionData.gateway_ref,
      amount: transactionData.amount,
      merchantAmount: transactionData.merchant_amount,
      currency: transactionData.currency,
      transactionStatus: transactionData.transaction_status,
      transactionType: transactionData.transaction_type,
      paymentType: paymentInfo.payment_type,
      cardType: paymentInfo.card_type,
      pan: paymentInfo.pan,
      tokenId: paymentInfo.token_id,
      customerMobile: transactionData.customer_mobile,
      isRecurring: transactionData.is_recurring,
      meta: transactionData.meta,
      merchantId: transactionData.merchant_id,
      squadCreatedAt: transactionData.created_at,
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
