"use client";

import { readData } from "@/lib/storage";

export default function AdminVerifyPage() {
  const data = readData();
  return (
    <div className='grid gap-2'>
      <h1 className='text-2xl font-semibold tracking-tight'>Verification</h1>
      <p className='text-muted-foreground text-sm'>
        Manual verification page (mock).
      </p>
      <div className='rounded-xl border p-4 bg-card text-sm'>
        Current user status: {data.user?.status ?? "none"}
      </div>
    </div>
  );
}
