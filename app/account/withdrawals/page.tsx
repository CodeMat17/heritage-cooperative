"use client";

import { findCategoryById, isLoanEligible, naira } from "@/lib/mock";
import {
  addTransaction,
  generateId,
  getUser,
  getWallet,
  setWallet,
} from "@/lib/storage";
import dayjs from "dayjs";
import { useState } from "react";

export default function WithdrawalsPage() {
  const user = getUser();
  const wallet = getWallet();
  const category = findCategoryById(user?.categoryId);
  const eligible = isLoanEligible(
    user?.joinDateIso,
    category?.durationDays ?? 90
  );
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = Math.max(0, Number(amount));
    if (!value) return;
    if (!eligible) {
      setStatus("Not eligible yet. Complete 90 days.");
      return;
    }
    if (value > wallet.balanceNaira) {
      setStatus("Insufficient balance.");
      return;
    }
    setWallet({ balanceNaira: wallet.balanceNaira - value });
    addTransaction({
      id: generateId("tx"),
      type: "withdrawal",
      amountNaira: value,
      createdAtIso: dayjs().toISOString(),
      note: "Simulated withdrawal",
    });
    setStatus(`Withdrawal requested: ${naira(value)}`);
    setAmount("");
  }

  return (
    <div className='grid gap-6'>
      <div className='grid gap-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>Withdrawals</h1>
        <p className='text-muted-foreground'>
          Request a withdrawal after 90 days (simulated for now). Plan your
          contributions wisely.
        </p>
      </div>
      <div className='rounded-xl border p-4 bg-card'>
        <div className='text-sm'>
          Eligibility:{" "}
          <span
            className={
              eligible
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }>
            {eligible ? "Eligible" : "Not eligible"}
          </span>
        </div>
        <form onSubmit={submit} className='mt-3 flex gap-2'>
          <input
            type='number'
            min={0}
            className='h-10 flex-1 rounded-md border px-3 bg-background'
            placeholder='Amount (₦)'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className='h-10 px-4 rounded-md bg-primary text-primary-foreground hover:opacity-90'
            type='submit'>
            Request
          </button>
        </form>
        {status && (
          <div className='mt-2 text-sm text-muted-foreground'>{status}</div>
        )}
      </div>
    </div>
  );
}
