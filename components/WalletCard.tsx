"use client";

import SquadPayButton from "@/app/dashboard/SquadPayButton";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";

export default function WalletCard({
  id,
  userName,
  userTier,
  userEmail,
}: {
  id: string;
  userName: string;
  userTier: string;
  userEmail: string;
}) {
  const [clerkUserId, setClerkUserId] = useState("");
  const [fullname, setFullname] = useState("");
  const [tier, setTier] = useState("");
  const [email, setEmail] = useState("");

  const [resolvedKey, setResolvedKey] = useState<string>("");

  // Get daily contribution amount based on tier
  const getDailyContribution = (tier: string): number => {
    switch (tier.toLowerCase()) {
      case "bronze":
        return 500;
      case "silver":
        return 1000;
      case "gold":
        return 2000;
      case "diamond":
        return 5000;
      case "emerald":
        return 10000;
      default:
        return 0;
    }
  };

  // Get user's last payment
  const lastPayment = useQuery(api.userContributions.getByUserId, {
    clerkUserId: clerkUserId,
  });

  // Get the most recent successful payment
  const getLastPaymentDate = () => {
    if (!lastPayment || lastPayment.length === 0) {
      return null;
    }

    const successfulPayments = lastPayment.filter(
      (payment) =>
        payment.transactionStatus === "success" ||
        payment.transactionStatus === "Success"
    );

    if (successfulPayments.length === 0) {
      return null;
    }

    // Sort by processedAt and get the most recent
    const mostRecent = successfulPayments.sort(
      (a, b) => b.processedAt - a.processedAt
    )[0];
    return mostRecent.processedAt;
  };

  const lastPaymentDate = getLastPaymentDate();
  const dailyContribution = getDailyContribution(tier);
  const amount = Number(dailyContribution);

  useEffect(() => {
    if (id) {
      setClerkUserId(id);
      setFullname(userName);
      setTier(userTier);
      setEmail(userEmail);
    }
  }, [id, userName, userTier, userEmail]);

  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const response = await fetch("/api/config/squad-public-key");
        const data = await response.json();
        setResolvedKey(
          typeof data.publicKey === "string" ? data.publicKey : ""
        );
      } catch (error) {
        console.error("Failed to fetch Squad public key", error);
        setResolvedKey("");
      }
    };
    fetchPublicKey();
  }, []);

  const handleSuccess = () => {
    toast.success("Payment successful!");
  };

  return (
    <div className='rounded-xl border p-4 bg-card w-full bg-gradient-to-br from-primary/10 to-primary/5'>
      <h1 className='text-lg sm:text-xl font-medium text-blue-500'>Wallet</h1>

      <div className='mt-3 space-y-2'>
        <p className='font-medium text-base sm:text-lg'>{fullname}</p>
        <p className='text-xs sm:text-sm font-medium text-muted-foreground capitalize'>
          {tier} Daily Contribution: ₦{dailyContribution.toLocaleString()}
        </p>
        <p className='text-xs sm:text-sm text-muted-foreground'>
          Last Payment:{" "}
          {lastPaymentDate
            ? dayjs(lastPaymentDate).format("MMM D, YYYY [at] h:mm A")
            : "No daily contribution found"}
        </p>

        <SquadPayButton
          email={email}
          amount={amount}
          publicKey={resolvedKey ?? ""}
          onSuccess={handleSuccess}
          lastPaymentDate={lastPaymentDate}
        />
      </div>
    </div>
  );
}
