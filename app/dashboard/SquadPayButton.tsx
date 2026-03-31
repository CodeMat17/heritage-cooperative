"use client";

import { useRef } from "react";
import { toast } from "sonner";

interface SquadPayProps {
  email: string;
  amount: number; // in Naira — multiplied by 100 internally
  publicKey: string;
  meta?: Record<string, string>;
  disabled?: boolean;
  children: React.ReactNode;
  onSuccess?: () => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    squad: any;
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function SquadPayButton({
  email,
  amount,
  publicKey,
  meta,
  disabled,
  children,
  onSuccess,
  onClose,
}: SquadPayProps) {
  const openingRef = useRef(false);

  const launchWidget = () => {
    const squadInstance = new window.squad({
      onClose: () => {
        openingRef.current = false;
        onClose?.();
      },
      onLoad: () => {},
      onSuccess: () => {
        openingRef.current = false;
        onSuccess?.();
        setTimeout(() => window.location.reload(), 1500);
      },
      key: publicKey,
      email,
      amount: amount * 100, // kobo
      currency_code: "NGN",
      ...(meta ? { meta } : {}),
    });
    squadInstance.setup();
    squadInstance.open();
  };

  const handlePayment = () => {
    if (openingRef.current) return;
    if (!publicKey) {
      toast.error("Payment is not configured. Please contact support.");
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

    openingRef.current = true;

    // Poll for up to 5 seconds in case the script is still initializing
    const waitForSquad = (retries = 20): void => {
      if (typeof window.squad !== "undefined") {
        launchWidget();
        return;
      }
      if (retries <= 0) {
        openingRef.current = false;
        toast.error(
          "Payment widget failed to load. Make sure this domain is whitelisted in your Squad dashboard."
        );
        return;
      }
      setTimeout(() => waitForSquad(retries - 1), 250);
    };

    waitForSquad();
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || !publicKey}
      className="w-full h-12 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {children}
    </button>
  );
}
