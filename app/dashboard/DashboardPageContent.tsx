"use client";

import ContribSparkline from "@/components/ContribSparkline";
import TransactionHistory from "@/components/TransactionHistory";
import WalletCard from "@/components/WalletCard";
import { api } from "@/convex/_generated/api";
import { MEMBERSHIP_CATEGORIES, naira } from "@/lib/mock";
import { Transaction } from "@/lib/types";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Tier = "bronze" | "silver" | "gold" | "diamond" | "emerald";

function TierSummary({ tier }: { tier: Tier }) {
  return (
    <div className='rounded-xl border bg-card p-5 shadow-md'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold capitalize'>Your Tier: {tier}</h2>
      </div>
      <p className='mt-2 text-sm text-muted-foreground'>
        Your contributions and benefits are based on your selected tier.
      </p>
    </div>
  );
}

export default function DashboardPageContent() {
  const me = useQuery(api.users.getMe);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch transaction data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/mock");
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (me === undefined) {
    return <div className='p-6'>Loading...</div>;
  }

  if (!me || !me.tier) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-8 min-h-screen'>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          Dashboard
        </h1>
        <div className='rounded-xl border bg-card p-5 mt-8 max-w-xl'>
          <div className='text-sm mb-2'>
            You haven&apos;t selected a tier yet.
          </div>
          <Link
            href='/dashboard/select-tier'
            className='inline-flex h-9 items-center rounded-md bg-primary px-3 text-primary-foreground hover:opacity-90'>
            Select your tier
          </Link>
        </div>
      </div>
    );
  }

  // Get tier details from mock data
  const tierCategory = MEMBERSHIP_CATEGORIES.find((cat) => cat.id === me.tier);

  // Calculate total contributed and loan eligibility
  const totalContributedAmount = me.totalContributed || 0;
  const requiredAmount = tierCategory
    ? tierCategory.dailyContributionNaira * tierCategory.durationDays
    : 0;
  const isEligibleForLoan = totalContributedAmount >= requiredAmount;

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 grid gap-6'>
      <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
        Dashboard
      </h1>
      <div className='flex flex-col gap-6 lg:flex-row'>
        {/* <TierSummary tier={me.tier as Tier} /> */}
        <TierPackageDetails tier={me.tier as Tier} />

        {/* Contributions Summary */}
        <div className='rounded-xl border bg-card p-5 shadow-md w-full'>
          <h1 className='text-lg font-semibold mb-3'>Contributions Summary</h1>
          <div className=''>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>
                Total Contributed:
              </span>
              <span className='font-medium'>
                {naira(totalContributedAmount)}
              </span>
            </div>
          
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>
                Due for Loan:
              </span>
              <span
                className={`font-medium ${isEligibleForLoan ? "text-green-600" : "text-red-600"}`}>
                {isEligibleForLoan ? "Yes" : "No"}
              </span>
            </div>
            <div className='pt-6'>
              <button
                disabled={!isEligibleForLoan}
                className={`w-full h-9 items-center rounded-md px-3 text-sm font-medium transition-colors ${
                  isEligibleForLoan
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                onClick={() => {
                  if (isEligibleForLoan) {
                    // TODO: Implement loan application logic
                    console.log("Apply for loan clicked");
                  }
                }}>
                Apply For Loan
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <WalletCard />
      </div>

   

        {/* Transactions History */}
        <div className='rounded-xl border bg-card p-6 shadow-md'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground'>
                Loading transactions...
              </div>
            </div>
          ) : (
            <TransactionHistory transactions={transactions} />
          )}
        </div>
   
    </div>
  );
}

const TIER_DETAILS: Record<
  Tier,
  { daily: number; durationDays: number; loan: number; perks: string[] }
> = {
  bronze: {
    daily: 500,
    durationDays: 90,
    loan: 100_000,
    perks: ["Basic savings", "Standard support"],
  },
  silver: {
    daily: 1_000,
    durationDays: 90,
    loan: 180_000,
    perks: ["Priority savings", "Standard support"],
  },
  gold: {
    daily: 2_000,
    durationDays: 90,
    loan: 360_000,
    perks: ["Priority savings", "Faster approvals"],
  },
  diamond: {
    daily: 5_000,
    durationDays: 90,
    loan: 1_000_000,
    perks: ["Premium savings", "Priority approvals", "Bonus features"],
  },
  emerald: {
    daily: 10_000,
    durationDays: 90,
    loan: 2_000_000,
    perks: ["Elite savings", "VIP support", "Maximum benefits"],
  },
};

function TierPackageDetails({ tier }: { tier: Tier }) {
  const details = TIER_DETAILS[tier];
  const naira = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);
  return (
    <div className='rounded-xl border bg-card p-5 bg-gradient-to-br from-blue-300/10 to-blue-800/50 w-full'>
      <div className=''>
        <div className='text-lg font-semibold'>Tier Summary</div>
        <p className='text-sm text-muted-foreground'>
          Your contributions and benefits are based on your selected tier.
        </p>

        <p className='mt-3 capitalize'>Your Tier - {tier}</p>
        <p>
          Daily Contribution - <span> {naira(details.daily)}</span>
        </p>
        <div>
          Loan Entitlement Duration -{" "}
          <span className='font-medium'>{details.durationDays} days</span>
        </div>
        <div>
          Loan Entitlement -{" "}
          <span className='font-medium'>{naira(details.loan)}</span>
        </div>
      </div>
      {/* <div className='text-sm'>
        <div className='font-medium mb-1'>Perks</div>
        <ul className='list-disc pl-5 text-muted-foreground'>
          {details.perks.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}
