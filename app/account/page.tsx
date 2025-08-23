"use client";

import AccountSummary from "@/components/AccountSummary";
import ContribSparkline from "@/components/ContribSparkline";
import ContributeBanner from "@/components/ContributeBanner";
import DailyContribution from "@/components/DailyContribution";
import LoanDueBanner from "@/components/LoanDueBanner";
import StreakCard from "@/components/StreakCard";
import { getUser } from "@/lib/storage";
import Link from "next/link";

export default function AccountPage() {
  const user = getUser();
  const isVerified = user?.status === "verified" || user?.verified === true;

  return (
    <div className='grid gap-6'>
      <ContributeBanner />
      <div className='grid gap-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>Account</h1>
        <p className='text-muted-foreground'>
          See your total contributions, savings growth, and loan entitlement
          status.
        </p>
      </div>
      {!isVerified && (
        <div className='rounded-xl border p-4 bg-card text-sm'>
          Your account is pending verification. You currently have limited
          access.
        </div>
      )}
      {isVerified && !user?.categoryId && (
        <div className='rounded-xl border p-4 bg-card text-sm'>
          You have not selected a category yet.{" "}
          <Link href='/categories' className='underline'>
            Choose a category
          </Link>{" "}
          to start saving.
        </div>
      )}
      <AccountSummary />
      <LoanDueBanner />
      <ContribSparkline />
      <StreakCard />
      <DailyContribution />
      <div className='flex gap-4'>
        <Link
          href='/account/goals'
          className='h-10 px-4 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-sm flex items-center'>
          Set Savings Goal
        </Link>
        <Link
          href='/account/withdrawals'
          className='h-10 px-4 rounded-md border text-sm flex items-center'>
          Withdrawals
        </Link>
      </div>
    </div>
  );
}
