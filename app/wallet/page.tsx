"use client";

import WalletCard from "@/components/WalletCard";
import { getUser } from "@/lib/storage";
import Link from "next/link";

export default function WalletPage() {
  const user = getUser();
  return (
    <div className='grid gap-6'>
      <div className='grid gap-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>Wallet</h1>
        <p className='text-muted-foreground'>
          Manage your savings wallet! Add funds manually for now, track your
          daily contributions, and watch your balance grow.
        </p>
      </div>
      {user?.status !== "verified" && (
        <div className='rounded-xl border p-4 bg-card text-sm'>
          Your account is pending verification. You currently have limited
          access.
        </div>
      )}
      {user?.status === "verified" && !user?.categoryId && (
        <div className='rounded-xl border p-4 bg-card text-sm'>
          Select a category first to start saving.
        </div>
      )}
      <WalletCard publicKey={process.env.SQUAD_PUBLIC_KEY} />
      <Link href='/wallet/history' className='text-sm underline w-fit'>
        Contribution History
      </Link>
    </div>
  );
}
