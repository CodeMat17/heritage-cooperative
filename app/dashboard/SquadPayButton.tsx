"use client";

/**
 * SquadPayButton — Heritage Cooperative
 *
 * Loads the Squad checkout widget on demand and opens it when the user clicks.
 * Follows the Squad Payment Modal API exactly as documented at:
 * https://docs.squadco.com/Payments/squad-payment-modal
 *
 * IMPORTANT — before this works you must:
 * 1. Add your domain to Squad dashboard → Settings → API Keys & Webhooks → Allowed Domains
 *    (add both "localhost:3000" for dev and "heritage-cooperative.com.ng" for production)
 * 2. Set SQUAD_PUBLIC_KEY in your .env.local
 * 3. Point your Squad webhook URL to: https://<your-domain>/api/webhooks/squad
 */

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    squad: any;
  }
}

export interface SquadMetadata {
  coveredDates: string;  // JSON-stringified string[] of YYYY-MM-DD dates
  daysCount: string;     // stringified number
}

interface SquadPayButtonProps {
  email: string;
  amount: number;            // in Naira — converted to kobo (×100) internally
  publicKey: string;
  metadata?: SquadMetadata;  // custom data returned in webhook
  disabled?: boolean;
  children: React.ReactNode;
  onSuccess?: (transactionRef: string) => void;
  onClose?: () => void;
}

const SQUAD_SCRIPT = "https://checkout.squadco.com/widget/squad.min.js";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function loadSquadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (typeof window.squad !== "undefined") {
      resolve();
      return;
    }
    // Script tag already in DOM (still loading)
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SQUAD_SCRIPT}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("DOMAIN_NOT_WHITELISTED"))
      );
      return;
    }
    // Fresh load
    const script = document.createElement("script");
    script.src = SQUAD_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("DOMAIN_NOT_WHITELISTED"));
    document.body.appendChild(script);
  });
}

export default function SquadPayButton({
  email,
  amount,
  publicKey,
  metadata,
  disabled,
  children,
  onSuccess,
  onClose,
}: SquadPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const busyRef = useRef(false);

  // Pre-load the script as soon as the button mounts so it is ready on first click
  useEffect(() => {
    loadSquadScript().catch(() => {
      // Silently ignore pre-load failures; the click handler will surface the error
    });
  }, []);

  async function handlePayment() {
    if (busyRef.current || disabled) return;

    if (!publicKey) {
      toast.error("Payment not configured — contact support.");
      return;
    }
    if (!email || !isValidEmail(email)) {
      toast.error("A valid email address is required.");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("Payment amount is missing.");
      return;
    }

    busyRef.current = true;
    setLoading(true);

    try {
      await loadSquadScript();
    } catch {
      busyRef.current = false;
      setLoading(false);
      toast.error(
        "Payment widget failed to load. " +
        "Please add this domain to your Squad dashboard → Settings → Allowed Domains, then refresh."
      );
      return;
    }

    setLoading(false);

    // Open the Squad checkout widget exactly as documented
    const squadInstance = new window.squad({
      key: publicKey,
      email,
      amount: amount * 100,   // kobo
      currency_code: "NGN",
      customer_name: email,   // will be replaced by actual name if Squad has it
      ...(metadata ? { metadata } : {}),
      onLoad: () => {
        // Widget is visible
      },
      onClose: () => {
        busyRef.current = false;
        onClose?.();
      },
      onSuccess: async (response: { transaction_ref?: string }) => {
        busyRef.current = false;
        const ref = response?.transaction_ref ?? "";

        // Verify the transaction server-side before celebrating
        if (ref) {
          try {
            const res = await fetch(`/api/squad/verify?ref=${encodeURIComponent(ref)}`);
            const data = await res.json();
            const status = (
              data?.data?.transaction_status ??
              data?.transaction_status ??
              ""
            ).toLowerCase();

            if (status === "success") {
              toast.success("Payment successful! Your contribution has been recorded.");
              onSuccess?.(ref);
              setTimeout(() => window.location.reload(), 1500);
              return;
            }
          } catch {
            // Verification failed — fall through to generic success
          }
        }

        // Webhook will record it regardless — reload so dashboard reflects new data
        toast.success("Payment received! Dashboard will update shortly.");
        onSuccess?.(ref);
        setTimeout(() => window.location.reload(), 2000);
      },
    });

    squadInstance.setup();
    squadInstance.open();
  }

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || !publicKey || loading}
      className="w-full h-12 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          Opening payment…
        </>
      ) : (
        children
      )}
    </button>
  );
}
