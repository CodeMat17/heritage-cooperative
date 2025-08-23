"use client";

import { listContributions } from "@/lib/storage";
import dayjs from "dayjs";

type Props = {
  days?: number;
};

export default function ContribCalendar({ days = 30 }: Props) {
  const contributions = listContributions();
  const end = dayjs().endOf("day");
  const start = end.subtract(days - 1, "day");

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = start.add(i, "day").format("YYYY-MM-DD");
    byDay.set(d, 0);
  }

  contributions.forEach((c) => {
    const key = dayjs(c.contributedAtIso).format("YYYY-MM-DD");
    if (byDay.has(key)) {
      byDay.set(key, (byDay.get(key) ?? 0) + c.amountNaira);
    }
  });

  const entries = Array.from(byDay.entries());
  const missedCount = entries.filter(([, v]) => v === 0).length;

  return (
    <div className='rounded-xl border p-4 bg-card w-full'>
      <div className='flex items-center justify-between mb-3'>
        <div className='text-sm font-medium'>Contribution Calendar</div>
        <div className='text-xs text-muted-foreground'>
          {start.format("MMM D")} – {end.format("MMM D")}
        </div>
      </div>
      <div className='grid grid-cols-7 sm:grid-cols-7 gap-2'>
        {entries.map(([date, value]) => (
          <div key={date} className='flex flex-col items-center gap-1'>
            <div
              title={`${date}${value > 0 ? ` • ₦${value.toLocaleString()}` : " • missed"}`}
              className={
                value > 0
                  ? "size-6 rounded-md bg-emerald-500/80"
                  : "size-6 rounded-md bg-red-500/80"
              }
            />
            <div className='text-[10px] text-muted-foreground'>
              {dayjs(date).format("D")}
            </div>
          </div>
        ))}
      </div>
      {missedCount > 0 && (
        <div className='mt-3 text-xs text-red-600'>
          Missed {missedCount} day{missedCount === 1 ? "" : "s"} in the last{" "}
          {days} days.
        </div>
      )}
    </div>
  );
}
