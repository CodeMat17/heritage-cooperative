"use client";

import { findCategoryById, naira, remainingDays } from "@/lib/mock";
import { getUser, totalContributed } from "@/lib/storage";
import dayjs from "dayjs";

export default function AccountSummary() {
  const user = getUser();
  const category = findCategoryById(user?.categoryId);
  const contributed = totalContributed();
  const daysLeft = remainingDays(
    user?.joinDateIso,
    category?.durationDays ?? 90
  );
  const createdAt = user?.joinDateIso
    ? dayjs(user.joinDateIso).format("MMM D, YYYY")
    : "—";

  return (
    <div className='rounded-xl border p-4 bg-card grid gap-2'>
      <div className='text-sm text-muted-foreground'>Account Summary</div>
      <div className='grid gap-1'>
        <div className='text-sm'>
          Account Created: <span className='font-medium'>{createdAt}</span>
        </div>
        <div className='text-sm'>
          Category:{" "}
          <span className='font-medium'>
            {category?.name ?? "Not selected"}
          </span>
        </div>
        <div className='text-sm'>
          Total Contributed:{" "}
          <span className='font-medium'>{naira(contributed)}</span>
        </div>
        <div className='text-sm'>
          Days Left: <span className='font-medium'>{daysLeft}</span>
        </div>
      </div>
    </div>
  );
}
