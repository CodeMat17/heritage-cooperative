"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Award, Diamond, Gem, Medal, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

type Tier = {
  id: "bronze" | "silver" | "gold" | "diamond" | "emerald";
  name: string;
  daily: number;
  durationDays: number;
  loan: number;
  blurb: string;
};

const TIERS: Tier[] = [
  {
    id: "bronze",
    name: "Bronze",
    daily: 500,
    durationDays: 90,
    loan: 100_000,
    blurb: "Entry plan to build consistency.",
  },
  {
    id: "silver",
    name: "Silver",
    daily: 1_000,
    durationDays: 90,
    loan: 180_000,
    blurb: "Balanced plan for steady savers.",
  },
  {
    id: "gold",
    name: "Gold",
    daily: 2_000,
    durationDays: 90,
    loan: 360_000,
    blurb: "Accelerate growth with momentum.",
  },
  {
    id: "diamond",
    name: "Diamond",
    daily: 5_000,
    durationDays: 90,
    loan: 1_000_000,
    blurb: "High-capacity plan for ambitious targets.",
  },
  {
    id: "emerald",
    name: "Emerald",
    daily: 10_000,
    durationDays: 90,
    loan: 2_000_000,
    blurb: "Elite plan for maximum leverage.",
  },
];

function TierIcon({ id }: { id: Tier["id"] }) {
  if (id === "bronze")
    return (
      <span className='h-10 w-10 grid place-items-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20'>
        <Medal className='h-5 w-5 text-amber-600' />
      </span>
    );
  if (id === "silver")
    return (
      <span className='h-10 w-10 grid place-items-center rounded-lg bg-gray-400/10 ring-1 ring-gray-400/20'>
        <Award className='h-5 w-5 text-gray-400' />
      </span>
    );
  if (id === "gold")
    return (
      <span className='h-10 w-10 grid place-items-center rounded-lg bg-yellow-500/10 ring-1 ring-yellow-500/20'>
        <Trophy className='h-5 w-5 text-yellow-500' />
      </span>
    );
  if (id === "diamond")
    return (
      <span className='h-10 w-10 grid place-items-center rounded-lg bg-sky-400/10 ring-1 ring-sky-400/20'>
        <Diamond className='h-5 w-5 text-sky-400' />
      </span>
    );
  return (
    <span className='h-10 w-10 grid place-items-center rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/20'>
      <Gem className='h-5 w-5 text-emerald-400' />
    </span>
  );
}

export default function SelectTierClient() {
  const setUserTier = useMutation(api.users.setUserTier);
  const router = useRouter();
  const [submittingId, setSubmittingId] = React.useState<string | null>(null);

  async function handleSelect(tierId: Tier["id"]) {
    try {
      setSubmittingId(tierId);
      await setUserTier({ tier: tierId });
      toast.success(`${tierId} selected`);
      router.replace("/dashboard");
    } catch (error) {
      console.log("Error Msg: ", error);
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 grid gap-8'>
      <div>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          Select your tier
        </h1>
        <p className='text-muted-foreground'>
          Choose a membership tier to get started. You can change this later.
        </p>
      </div>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {TIERS.map((t) => (
          <div key={t.id} className='rounded-xl border bg-card p-5 shadow-md'>
            <div className='flex items-baseline justify-between'>
              <div className='flex items-center gap-2'>
                <TierIcon id={t.id} />
                <h3 className='text-lg font-semibold capitalize'>{t.name}</h3>
              </div>
              <span className='text-xs rounded-full border px-2 py-0.5'>
                {t.durationDays} days
              </span>
            </div>
            <p className='mt-1 text-sm text-muted-foreground'>{t.blurb}</p>
            <div className='mt-4 grid gap-1 text-sm'>
              <div>
                Daily Contribution:{" "}
                <span className='font-medium'>
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 0,
                  }).format(t.daily)}
                </span>
              </div>
              <div>
                Loan Entitlement:{" "}
                <span className='font-medium'>
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 0,
                  }).format(t.loan)}
                </span>
              </div>
            </div>
            <div className='mt-4 flex gap-2'>
              <button
                onClick={() => handleSelect(t.id)}
                disabled={submittingId === t.id}
                className='h-9 inline-flex items-center rounded-md bg-primary px-3 text-primary-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'>
                {submittingId === t.id ? "Selecting..." : `Select ${t.name}`}
              </button>
              <Link
                href={`/tiers/${t.id}`}
                className='h-9 inline-flex items-center rounded-md border px-3 hover:bg-muted'>
                Learn more
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
