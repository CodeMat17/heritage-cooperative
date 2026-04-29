import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Called by the client after Squad onSuccess + client-side verification.
// Acts as a fallback so contributions are recorded even when Squad's webhook
// doesn't reach the server (mis-configured URL, signature issue, etc.).
// The Convex action is idempotent — duplicate transactionRefs are silently ignored.
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const transactionRef: unknown = body?.transactionRef;
  if (typeof transactionRef !== "string" || !transactionRef) {
    return NextResponse.json({ error: "Missing transactionRef" }, { status: 400 });
  }

  const secretKey = process.env.SQUAD_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const baseUrl =
    secretKey.startsWith("test_sk") || secretKey.startsWith("sandbox_sk")
      ? "https://sandbox-api-d.squadco.com"
      : "https://api-d.squadco.com";

  // Re-verify server-side — never trust client-supplied payment data
  const verifyRes = await fetch(
    `${baseUrl}/transaction/verify/${encodeURIComponent(transactionRef)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  ).catch(() => null);

  if (!verifyRes?.ok) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 402 });
  }

  const verifyData = await verifyRes.json();
  const tx = verifyData?.data;

  if (!tx || tx.transaction_status !== "success") {
    return NextResponse.json({ error: "Payment not successful" }, { status: 402 });
  }

  try {
    const result = await convex.action(api.webhooks.processSquadPayment, {
      webhookSecret: process.env.CONVEX_WEBHOOK_SECRET!,
      transactionRef: tx.transaction_ref ?? transactionRef,
      email: tx.email,
      amount: tx.amount,
      merchantAmount: tx.merchant_amount ?? tx.amount,
      currency: tx.currency ?? "NGN",
      transactionStatus: tx.transaction_status,
      transactionType: tx.transaction_type ?? "unknown",
      gatewayRef: tx.gateway_ref ?? undefined,
      paymentType: tx.payment_information?.payment_type ?? undefined,
      cardType: tx.payment_information?.card_type ?? undefined,
      pan: tx.payment_information?.pan ?? undefined,
      tokenId: tx.payment_information?.token_id ?? undefined,
      customerMobile: tx.customer_mobile ?? undefined,
      isRecurring: tx.is_recurring ?? undefined,
      meta: tx.meta ?? tx.metadata ?? undefined,
      merchantId: tx.merchant_id ?? undefined,
      squadCreatedAt: tx.created_at ?? new Date().toISOString(),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("contributions/confirm: Convex error", err);
    return NextResponse.json({ error: "Failed to record contribution" }, { status: 500 });
  }
}
