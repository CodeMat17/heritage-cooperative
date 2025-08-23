"use client";

import { naira } from "@/lib/mock";
import { listTransactions } from "@/lib/storage";
import dayjs from "dayjs";

export default function WalletHistoryPage() {
  const txs = listTransactions();
  return (
    <div className='grid gap-4'>
      <h1 className='text-2xl font-semibold tracking-tight'>
        Transaction History
      </h1>
      <div className='rounded-xl border divide-y'>
        {txs.length === 0 && (
          <div className='p-4 text-sm text-muted-foreground'>
            No transactions yet.
          </div>
        )}
        {txs.map((t) => (
          <div key={t.id} className='p-4 flex items-center justify-between'>
            <div className='text-sm capitalize'>{t.type}</div>
            <div className='text-sm'>
              {dayjs(t.createdAtIso).format("D MMM, YYYY h:mm A")}
            </div>
            <div className='font-medium'>{naira(t.amountNaira)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
