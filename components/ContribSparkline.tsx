"use client";

import { listContributions } from "@/lib/storage";
import dayjs from "dayjs";
import React from "react";

type DayStat = { date: string; total: number };

function buildDayStats(days = 14): DayStat[] {
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

  return Array.from(byDay.entries()).map(([date, total]) => ({ date, total }));
}

export default function ContribSparkline({
  width = 480,
  height = 160,
  days = 14,
}: {
  width?: number;
  height?: number;
  days?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(width);
  React.useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cw = Math.floor(entry.contentRect.width);
        if (cw > 0) setContainerWidth(cw);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const stats = buildDayStats(days);
  const max = Math.max(1, ...stats.map((s) => s.total));
  const padding = 12;
  const W = containerWidth;
  const innerW = W - padding * 2;
  const innerH = height - padding * 2;
  const barGap = 8;
  const barWidth = Math.max(8, Math.floor(innerW / stats.length) - barGap);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);

  const naira = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);

  const missedCount = stats.filter((s) => s.total === 0).length;
  const streak = (() => {
    let count = 0;
    for (let i = stats.length - 1; i >= 0; i--) {
      if (stats[i].total > 0) count++;
      else break;
    }
    return count;
  })();

  return (
    <div
      ref={containerRef}
      className='rounded-xl border p-4 bg-card w-full overflow-hidden'>
      <div className='flex items-center justify-between mb-2'>
        <div className='text-sm font-medium'>Last {days} days</div>
        <div className='flex items-center gap-3 text-[11px] text-muted-foreground'>
          <span className='inline-flex items-center gap-1'>
            <span className='size-2 rounded-full bg-primary inline-block' />{" "}
            Contributed
          </span>
          <span className='inline-flex items-center gap-1'>
            <span className='size-2 rounded-full bg-red-500 inline-block' />{" "}
            Missed
          </span>
        </div>
      </div>
      <svg
        width='100%'
        height={height}
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio='none'>
        <defs>
          <linearGradient id='barFill' x1='0' x2='0' y1='0' y2='1'>
            <stop
              offset='0%'
              stopColor='hsl(var(--primary))'
              stopOpacity='0.9'
            />
            <stop
              offset='100%'
              stopColor='hsl(var(--primary))'
              stopOpacity='0.2'
            />
          </linearGradient>
          <linearGradient id='missedFill' x1='0' x2='0' y1='0' y2='1'>
            <stop offset='0%' stopColor='rgb(239 68 68)' stopOpacity='0.85' />
            <stop offset='100%' stopColor='rgb(239 68 68)' stopOpacity='0.25' />
          </linearGradient>
        </defs>
        {/* grid lines */}
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1={padding}
            x2={W - padding}
            y1={padding + innerH * r}
            y2={padding + innerH * r}
            stroke='currentColor'
            className='text-muted-foreground/20'
            strokeDasharray='4 4'
          />
        ))}
        {stats.map((s, i) => {
          const x = padding + i * (barWidth + barGap);
          const h = Math.max(2, (s.total / max) * innerH);
          const y = padding + innerH - h;
          const isMissed = s.total === 0;
          const activeIdx = selectedIdx !== null ? selectedIdx : hoverIdx;
          const isActive = activeIdx === i;
          return (
            <g
              key={s.date}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              onPointerDown={() =>
                setSelectedIdx((idx) => (idx === i ? null : i))
              }
              tabIndex={0}
              role='button'
              aria-label={`${dayjs(s.date).format("MMM D")}: ${s.total > 0 ? naira(s.total) : "Missed"}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedIdx((idx) => (idx === i ? null : i));
                }
              }}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={4}
                fill={isMissed ? "url(#missedFill)" : "url(#barFill)"}
                className='cursor-pointer'
              />
              {/* today marker */}
              {dayjs(s.date).isSame(dayjs(), "day") && (
                <circle
                  cx={x + barWidth / 2}
                  cy={padding + innerH + 4}
                  r={2}
                  className='text-primary'
                  fill='currentColor'
                />
              )}
              {/* hover dot */}
              {isActive && (
                <rect
                  x={x - 2}
                  y={y - 6}
                  width={barWidth + 4}
                  height={h + 12}
                  rx={6}
                  fill='currentColor'
                  className='text-primary/10'
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className='mt-2 flex items-center justify-between text-xs'>
        <div className='text-muted-foreground'>
          Missed <span className='text-red-600 font-medium'>{missedCount}</span>{" "}
          day{missedCount === 1 ? "" : "s"}; Streak:{" "}
          <span className='font-medium'>{streak}</span>
        </div>
        {(() => {
          const idx = selectedIdx !== null ? selectedIdx : hoverIdx;
          return idx !== null ? (
            <div className='font-medium'>
              {dayjs(stats[idx].date).format("MMM D")} •{" "}
              {stats[idx].total > 0 ? naira(stats[idx].total) : "Missed"}
            </div>
          ) : (
            <div className='text-muted-foreground'>Tap bars for details</div>
          );
        })()}
      </div>
    </div>
  );
}
