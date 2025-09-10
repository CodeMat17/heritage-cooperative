"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Award,
  BadgePercent,
  Banknote,
  Diamond,
  Gem,
  LineChart,
  Medal,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Tier = {
  id: string;
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
    blurb: "Entry plan to build consistency with minimal daily amount.",
  },
  {
    id: "silver",
    name: "Silver",
    daily: 1_000,
    durationDays: 90,
    loan: 180_000,
    blurb: "Balanced plan for steady savers aiming bigger.",
  },
  {
    id: "gold",
    name: "Gold",
    daily: 2_000,
    durationDays: 90,
    loan: 360_000,
    blurb: "Accelerate growth with double the momentum.",
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
    blurb: "Elite plan for maximum leverage and returns.",
  },
];

const ALLOWED_DAILY: number[] = [500, 1000, 2000, 5000, 10000];

function naira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

function renderTierIcon(tierId: Tier["id"]) {
  if (tierId === "bronze") {
    return (
      <span className='h-11 w-11 grid place-items-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20'>
        <Medal className='h-6 w-6 text-amber-600' />
      </span>
    );
  }
  if (tierId === "silver") {
    return (
      <span className='h-11 w-11 grid place-items-center rounded-lg bg-gray-400/10 ring-1 ring-gray-400/20'>
        <Award className='h-6 w-6 text-gray-400' />
      </span>
    );
  }
  if (tierId === "gold") {
    return (
      <span className='h-11 w-11 grid place-items-center rounded-lg bg-yellow-500/10 ring-1 ring-yellow-500/20'>
        <Trophy className='h-6 w-6 text-yellow-500' />
      </span>
    );
  }
  if (tierId === "diamond") {
    return (
      <span className='h-11 w-11 grid place-items-center rounded-lg bg-sky-400/10 ring-1 ring-sky-400/20'>
        <Diamond className='h-6 w-6 text-sky-400' />
      </span>
    );
  }
  // emerald
  return (
    <span className='h-11 w-11 grid place-items-center rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/20'>
      <Gem className='h-6 w-6 text-emerald-400' />
    </span>
  );
}

function getTierButtonClasses(tierId: Tier["id"]): string {
  if (tierId === "bronze") {
    return "bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-500/20";
  }
  if (tierId === "silver") {
    return "bg-gray-400/10 hover:bg-gray-400/20 ring-1 ring-gray-400/20";
  }
  if (tierId === "gold") {
    return "bg-yellow-500/10 hover:bg-yellow-500/20 ring-1 ring-yellow-500/20";
  }
  if (tierId === "diamond") {
    return "bg-sky-400/10 hover:bg-sky-400/20 ring-1 ring-sky-400/20";
  }
  return "bg-emerald-400/10 hover:bg-emerald-400/20 ring-1 ring-emerald-400/20";
}

export default function HomePage() {
  // Calculator state (discrete tiers only)
  const [amountIndex, setAmountIndex] = useState<number>(1);
  const dailyAmount: number = ALLOWED_DAILY[amountIndex];
  const applicableTier =
    TIERS.find((tier) => tier.daily === dailyAmount) || TIERS[0];
  const totalAfter90 = dailyAmount * 90;

  // Auth state
  const { isSignedIn, sessionClaims } = useAuth();
  const isOnboardingComplete = sessionClaims?.metadata?.onboardingComplete;

  return (
    <div className='grid gap-12 sm:gap-16 px-3 sm:px-4 py-8 max-w-7xl mx-auto'>
      {/* Hero Section */}
      <section className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center'>
        <div className='space-y-4 sm:space-y-5'>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'>
            Save Smart, Grow Strong
          </motion.h1>
          <p className='text-muted-foreground max-w-2xl text-base sm:text-lg leading-6 font-medium'>
            Welcome to Heritage Multipurpose Cooperative platform - where you
            grow savings daily, track your progress effortlessly and unlock
            tailored loans after 90 days.
          </p>
          <div className='flex flex-wrap gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full border px-2 sm:px-3 py-1 text-xs bg-gray-50 dark:bg-gray-800 shadow-md'>
              <Banknote className='h-3.5 w-3.5' /> Savings
            </span>
            <span className='inline-flex items-center gap-2 rounded-full border px-2 sm:px-3 py-1 text-xs bg-gray-50 dark:bg-gray-800 shadow-md'>
              <LineChart className='h-3.5 w-3.5' /> Investments
            </span>
            <span className='inline-flex items-center gap-2 rounded-full border px-2 sm:px-3 py-1 text-xs bg-gray-50 dark:bg-gray-800 shadow-md'>
              <BadgePercent className='h-3.5 w-3.5' /> Loans
            </span>
          </div>
          <div className='flex gap-3 pt-2'>
            {isSignedIn && isOnboardingComplete ? (
              <Button asChild>
                <Link href='/dashboard'>Go to dashboard</Link>
              </Button>
            ) : (
              <div className='flex gap-3 items-center' >
                
                <Button asChild size='lg'>
                  <Link href='/sign-in'>Sign in</Link>
                </Button>
                <Button asChild size='lg'>
                  <Link href='/sign-up'>Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <motion.div
            whileHover={{ y: -2 }}
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0,
            }}
            className='group relative overflow-hidden rounded-2xl border p-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md bg-gradient-to-br from-emerald-500/30 via-emerald-500/10 to-cyan-500/25 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'>
            <div
              aria-hidden
              className='pointer-events-none absolute -top-10 -right-12 h-32 w-32 rounded-full bg-emerald-400/40 blur-2xl opacity-90'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute -bottom-14 -left-14 h-36 w-36 rounded-full bg-cyan-400/35 blur-2xl opacity-80'
            />
            <div className='relative z-10 flex flex-col items-start gap-2'>
              <div className='h-10 w-10 grid place-items-center rounded-xl ring-cyan-500/25 dark:bg-white/15 ring-1 dark:ring-white/30 shadow-lg'>
                <Banknote className='h-5 w-5 dark:text-emerald-200' />
              </div>
              <div className='font-semibold'>Daily Savings</div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Automate or contribute manually and grow steadily.
              </p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -2 }}
            initial={{ y: 0 }}
            animate={{ y: [0, -9, 0] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.35,
            }}
            className='group relative overflow-hidden rounded-2xl border p-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md bg-gradient-to-br from-fuchsia-500/30 via-pink-500/10 to-rose-500/25 ring-1 ring-fuchsia-500/30 shadow-lg shadow-fuchsia-500/10'>
            <div
              aria-hidden
              className='pointer-events-none absolute -top-12 -left-10 h-32 w-32 rounded-full bg-fuchsia-400/40 blur-2xl opacity-90'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute -bottom-10 -right-12 h-32 w-32 rounded-full bg-rose-400/35 blur-2xl opacity-80'
            />
            <div className='relative z-10 flex flex-col items-start gap-2'>
              <div className='h-10 w-10 grid place-items-center rounded-xl bg-white/15 ring-1 ring-fuchsia-500/25 dark:ring-white/30 shadow-lg'>
                <BadgePercent className='h-5 w-5 dark:text-rose-200' />
              </div>
              <div className='font-semibold'>Loan Access</div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Unlock loan entitlement after 90 days of consistency.
              </p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -2 }}
            initial={{ y: 0 }}
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.7,
            }}
            className='group relative overflow-hidden rounded-2xl border p-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md bg-gradient-to-br from-indigo-500/30 via-sky-500/10 to-blue-500/25 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'>
            <div
              aria-hidden
              className='pointer-events-none absolute -top-12 -right-10 h-32 w-32 rounded-full bg-indigo-400/40 blur-2xl opacity-90'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-sky-400/35 blur-2xl opacity-80'
            />
            <div className='relative z-10 flex flex-col items-start gap-2'>
              <div className='h-10 w-10 grid place-items-center rounded-xl bg-white/15 ring-1 ring-blue-500/25 dark:ring-white/30 shadow-lg'>
                <LineChart className='h-5 w-5 dark:text-sky-200' />
              </div>
              <div className='font-semibold'>Progress Tracking</div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                See trends, streaks, and milestones at a glance.
              </p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -2 }}
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.05,
            }}
            className='group relative overflow-hidden rounded-2xl border p-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md bg-gradient-to-br from-amber-500/30 via-yellow-500/10 to-orange-500/25 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10'>
            <div
              aria-hidden
              className='pointer-events-none absolute -top-10 -left-12 h-32 w-32 rounded-full bg-amber-400/40 blur-2xl opacity-90'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute -bottom-14 -right-14 h-36 w-36 rounded-full bg-orange-400/35 blur-2xl opacity-80'
            />
            <div className='relative z-10 flex flex-col items-start gap-2'>
              <div className='h-10 w-10 grid place-items-center rounded-xl bg-white/15 ring-1 ring-orange-500/25 dark:ring-white/30 shadow-lg'>
                <Banknote className='h-5 w-5 dark:text-amber-200' />
              </div>
              <div className='font-semibold'>Flexible Tiers</div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Choose a plan that matches your goals and upgrade anytime.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tiers Section */}
      <section className='grid gap-4 sm:gap-6'>
        <div>
          <h2 className='text-xl sm:text-2xl md:text-3xl font-bold tracking-tight'>
            Membership Tiers
          </h2>
          <p className='text-sm sm:text-base text-muted-foreground max-w-lg'>
            Choose a tier to start daily savings. After 90 days of consistency,
            unlock your loan entitlement.
          </p>
        </div>
        <div className='grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {TIERS.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -2 }}
              className='rounded-xl border bg-card p-3 sm:p-5 shadow-md'>
              <div className='flex items-baseline justify-between'>
                <div className='flex items-center gap-2'>
                  {renderTierIcon(t.id)}
                  <h3 className='text-base sm:text-lg font-semibold capitalize'>
                    {t.name}
                  </h3>
                </div>
                <span className='text-xs rounded-full border px-2 py-0.5'>
                  90 days
                </span>
              </div>
              <p className='mt-1 text-xs sm:text-sm text-muted-foreground'>
                {t.blurb}
              </p>
              <div className='mt-3 sm:mt-4 grid gap-1 text-xs sm:text-sm'>
                <div>
                  Daily Contribution:{" "}
                  <span className='font-medium'>{naira(t.daily)}</span>
                </div>
                <div>
                  Duration:{" "}
                  <span className='font-medium'>{t.durationDays} days</span>
                </div>
                <div>
                  Loan Entitlement:{" "}
                  <span className='font-medium'>{naira(t.loan)}</span>
                </div>
              </div>
              <div className='mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2'>
                <Link
                  href={`/sign-up`}
                  className={`h-9 inline-flex items-center justify-center rounded-md px-3 hover:opacity-90 text-xs sm:text-sm ${getTierButtonClasses(t.id)}`}>
                  Select {t.name}
                </Link>
                <Link
                  href={`/tiers/${t.id}`}
                  className='h-9 inline-flex items-center justify-center rounded-md border px-3 hover:bg-muted text-xs sm:text-sm'>
                  Learn more
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className='grid gap-4 sm:gap-6'>
        <div>
          <h2 className='text-xl sm:text-2xl md:text-3xl font-bold tracking-tight'>
            How it works
          </h2>
          <p className='text-sm sm:text-base text-muted-foreground'>
            Join → Save daily → Unlock loan in 90 days.
          </p>
        </div>
        <div className='grid gap-3 sm:gap-4 sm:grid-cols-3'>
          <div className='rounded-xl border bg-card p-3 sm:p-5'>
            <div className='flex items-center gap-3'>
              <span className='h-8 w-8 sm:h-10 sm:w-10 grid place-items-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20'>
                <Medal className='h-4 w-4 sm:h-5 sm:w-5 text-emerald-500' />
              </span>
              <h3 className='text-sm sm:text-base font-semibold'>Join</h3>
            </div>
            <p className='mt-2 text-xs sm:text-sm text-muted-foreground'>
              Create your free account in minutes.
            </p>
          </div>
          <div className='rounded-xl border bg-card p-3 sm:p-5'>
            <div className='flex items-center gap-3'>
              <span className='h-8 w-8 sm:h-10 sm:w-10 grid place-items-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20'>
                <Banknote className='h-4 w-4 sm:h-5 sm:w-5 text-blue-500' />
              </span>
              <h3 className='text-sm sm:text-base font-semibold'>Save daily</h3>
            </div>
            <p className='mt-2 text-xs sm:text-sm text-muted-foreground'>
              Automate or contribute manually every day.
            </p>
          </div>
          <div className='rounded-xl border bg-card p-5'>
            <div className='flex items-center gap-3'>
              <span className='h-8 w-8 sm:h-10 sm:w-10 grid place-items-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20'>
                <BadgePercent className='h-4 w-4 sm:h-5 sm:w-5 text-amber-500' />
              </span>
              <h3 className='text-sm sm:text-base font-semibold'>
                Unlock loan
              </h3>
            </div>
            <p className='mt-2 text-xs sm:text-sm text-muted-foreground'>
              After 90 days of consistency, access your entitlement.
            </p>
          </div>
        </div>
      </section>

      {/* Savings & Loan Calculator */}
      <section className='grid gap-6'>
        <div>
          <h2 className='text-2xl md:text-3xl font-bold tracking-tight'>
            Savings & Loan Calculator
          </h2>
          <p className='text-muted-foreground'>
            Preview your 90-day savings and estimated loan entitlement.
          </p>
        </div>
        <div className='rounded-xl border bg-card p-5'>
          <div className='grid gap-4'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>Daily amount</div>
              <div className='font-semibold'>{naira(dailyAmount)}</div>
            </div>
            <input
              type='range'
              min={0}
              max={ALLOWED_DAILY.length - 1}
              step={1}
              value={amountIndex}
              onChange={(e) => setAmountIndex(Number(e.target.value))}
              className='w-full'
              list='daily-steps'
            />
            <datalist id='daily-steps'>
              {ALLOWED_DAILY.map((v, i) => (
                <option key={i} value={i} label={naira(v)} />
              ))}
            </datalist>
            <div className='flex justify-between text-xs text-muted-foreground'>
              {ALLOWED_DAILY.map((v) => (
                <span key={v}>{naira(v)}</span>
              ))}
            </div>
            <div className='grid gap-1 text-sm'>
              <div>
                After 90 days you’ll have{" "}
                <span className='font-medium'>{naira(totalAfter90)}</span>
              </div>
              <div>
                Estimated loan entitlement:{" "}
                <span className='font-medium'>
                  {naira(applicableTier.loan)}
                </span>{" "}
                ({applicableTier.name})
              </div>
            </div>
            {/* <div className='pt-1 text-xs text-muted-foreground'>
              Based on the nearest membership tier to your daily amount.
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
}
