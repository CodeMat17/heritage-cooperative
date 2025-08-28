// app/components/SquadPayButton.tsx
"use client"; // Marks this as a client-side component

import { Button } from "@/components/ui/button"; // Assuming Shadcn UI for styling
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface SquadPayProps {
  email: string;
  amount: number; // Amount in Naira (will be multiplied by 100 internally)
  publicKey: string;
  paymentMonth?: string; // Month the payment is for
  onSuccess?: () => void;
  onClose?: () => void;
  onLoad?: () => void;
}

// Define the Squad instance type based on the widget's API
interface SquadOptions {
  onClose: () => void;
  onLoad: () => void;
  onSuccess: () => void;
  key: string;
  email: string;
  amount: number;
  currency_code: string;
  callback_url: string;
  meta?: Record<string, string>;
}

interface SquadInstance {
  setup: () => void;
  open: () => void;
}

// Extend the window interface to include the squad constructor
declare global {
  interface Window {
    squad: {
      new (options: SquadOptions): SquadInstance;
    };
  }
}

function isValidEmailAddress(value: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value);
}

export default function SquadPayButton({
  email,
  amount,
  publicKey,
  paymentMonth,
  onSuccess,
  onClose,
  onLoad,
}: SquadPayProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const squadInstanceRef = useRef<SquadInstance | null>(null);
  const router = useRouter();

  // Dynamic callback URL based on environment
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const callbackUrl = `${baseUrl}/dashboard`;
  const webhookUrl = `${baseUrl}/api/webhooks/squad`;

  // Dynamically load Squad script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.squadco.com/widget/squad.min.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize Squad instance when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !window.squad) return;

    const hasEmail = typeof email === "string" && email.trim().length > 0;
    const hasAmount = typeof amount === "number" && amount > 0;
    const emailValid = hasEmail && isValidEmailAddress(email);

    if (!publicKey || !hasEmail || !hasAmount || !emailValid) {
      // Do not initialize the widget until we have valid values
      squadInstanceRef.current = null;
      return;
    }

    const options: SquadOptions = {
      onClose: () => {
        console.log("Widget closed");
        onClose?.();
      },
      onLoad: () => {
        console.log("Widget loaded successfully");
        onLoad?.();
      },
      onSuccess: () => {
        console.log("Payment linked successfully");
        router.push(callbackUrl);
        onSuccess?.();
      },
      key: publicKey,
      email,
      amount: amount * 100, // Convert to kobo (NGN)
      currency_code: "NGN",
      callback_url: callbackUrl,
      meta: paymentMonth ? { paymentMonth } : undefined,
    };

    squadInstanceRef.current = new window.squad(options);
    squadInstanceRef.current.setup();
  }, [
    scriptLoaded,
    email,
    amount,
    onSuccess,
    onClose,
    onLoad,
    publicKey,
    router,
    callbackUrl,
  ]);

  const handlePayment = () => {
    const hasEmail = typeof email === "string" && email.trim().length > 0;
    const hasAmount = typeof amount === "number" && amount > 0;

    if (!publicKey) {
      toast.error(
        "Payment configuration missing. Set SQUAD_PUBLIC_KEY in your server env."
      );
      return;
    }

    if (!hasEmail && !hasAmount) {
      toast.warning("Please provide your email and amount.");
      return;
    }

    if (!hasEmail) {
      toast.error("Email is required.");
      return;
    }

    if (hasEmail && !isValidEmailAddress(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!hasAmount) {
      toast.error("Amount is required.");
      return;
    }

    // Ensure instance is initialized with current validated values
    if (!squadInstanceRef.current && window.squad) {
      const options: SquadOptions = {
        onClose: () => {
          console.log("Widget closed");
          onClose?.();
        },
        onLoad: () => {
          console.log("Widget loaded successfully");
          onLoad?.();
        },
        onSuccess: () => {
          console.log("Payment linked successfully");

          onSuccess?.();
        },
        key: publicKey,
        email,
        amount: amount * 100,
        currency_code: "NGN",
        callback_url: callbackUrl,
        meta: paymentMonth ? { paymentMonth } : undefined,
      };
      squadInstanceRef.current = new window.squad(options);
      squadInstanceRef.current.setup();
    }

    if (squadInstanceRef.current) {
      squadInstanceRef.current.open();
    } else {
      console.error("Squad instance not initialized");
    }
  };

  return (
    <Button onClick={handlePayment} disabled={!scriptLoaded || !publicKey}>
      Add Funds
    </Button>
  );
}
