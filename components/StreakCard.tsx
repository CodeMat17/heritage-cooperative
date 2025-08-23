"use client";

import { listContributions } from "@/lib/storage";
import dayjs from "dayjs";

function calcStreak(): { streak: number; lastDate: string | null } {
  const contributions = listContributions();
  const days = new Set(
    contributions.map((c) => dayjs(c.contributedAtIso).format("YYYY-MM-DD"))
  );
  let streak = 0;
  let cursor = dayjs();
  while (days.has(cursor.format("YYYY-MM-DD"))) {
    streak += 1;
    cursor = cursor.subtract(1, "day");
  }
  const lastDate = contributions[0]?.contributedAtIso ?? null;
  return { streak, lastDate };
}

export default function StreakCard() {
  const { streak } = calcStreak();
  return (
    <div className='rounded-xl border p-4 bg-card'>
      <div className='text-sm text-muted-foreground'>Contribution Streak</div>
      <div className='text-2xl font-semibold'>
        {streak} day{streak === 1 ? "" : "s"}
      </div>
      <div className='text-xs text-muted-foreground'>
        Keep it up to maintain eligibility and hit your goals faster.
      </div>
    </div>
  );
}
