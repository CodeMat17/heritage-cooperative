"use client";

import SquadPayButton, { type SquadMetadata } from "@/app/dashboard/SquadPayButton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  Award,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Diamond,
  Gem,
  Lock,
  Medal,
  Trophy,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type PackageId = "bronze" | "silver" | "gold" | "diamond" | "emerald";

const PACKAGE_CONFIG: Record<
  PackageId,
  {
    daily: number;
    loan: number;
    color: string;
    bg: string;
    ring: string;
    Icon: React.ElementType;
  }
> = {
  bronze: {
    daily: 500,
    loan: 100_000,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    Icon: Medal,
  },
  silver: {
    daily: 1_000,
    loan: 180_000,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    ring: "ring-slate-400/20",
    Icon: Award,
  },
  gold: {
    daily: 2_000,
    loan: 360_000,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    ring: "ring-yellow-500/20",
    Icon: Trophy,
  },
  diamond: {
    daily: 5_000,
    loan: 1_000_000,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    ring: "ring-sky-400/20",
    Icon: Diamond,
  },
  emerald: {
    daily: 10_000,
    loan: 2_000_000,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    Icon: Gem,
  },
};

type Contribution = {
  _id: string;
  processedAt: number;
  transactionStatus: string;
  amount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: any;
};

function naira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format a YYYY-MM-DD UTC string for display */
function fmtDate(dateStr: string): string {
  // Parse as UTC midnight then format in UTC to avoid day-shift from local TZ offset
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Add N calendar days to a YYYY-MM-DD UTC string, returns YYYY-MM-DD UTC */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

/** Get today's date as YYYY-MM-DD in UTC (consistent with processedAt stored via Date.now()) */
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/** Collect all unique paid calendar dates from contributions.
 *  Reads meta.coveredDates (JSON string array) when present, else falls back to processedAt date.
 */
function getAllPaidDates(contributions: Contribution[]): Set<string> {
  const dates = new Set<string>();
  for (const c of contributions) {
    if (c.transactionStatus.toLowerCase() !== "success") continue;
    if (c.meta?.coveredDates) {
      try {
        const covered = JSON.parse(c.meta.coveredDates as string) as string[];
        if (Array.isArray(covered) && covered.length > 0) {
          covered.forEach((d) => dates.add(d));
          continue;
        }
      } catch {
        // fall through to processedAt
      }
    }
    dates.add(new Date(c.processedAt).toISOString().split("T")[0]);
  }
  return dates;
}

function countUniqueDays(contributions: Contribution[]): number {
  return getAllPaidDates(contributions).size;
}

function getLastPaymentTimestamp(contributions: Contribution[]): number | null {
  const successful = contributions
    .filter((c) => c.transactionStatus.toLowerCase() === "success")
    .sort((a, b) => b.processedAt - a.processedAt);
  return successful.length > 0 ? successful[0].processedAt : null;
}

function ContributionCalendar({
  contributions,
}: {
  contributions: Contribution[];
}) {
  const paidDates = getAllPaidDates(contributions);
  const today = todayStr();

  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {days.map((date) => {
          const paid = paidDates.has(date);
          const isToday = date === today;
          return (
            <div
              key={date}
              title={`${date}${paid ? " — Contributed" : " — Missed"}`}
              className={`h-7 w-7 rounded-md transition-colors ${
                paid ? "bg-emerald-500 dark:bg-emerald-600" : "bg-muted"
              } ${isToday ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-background" : ""}`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-emerald-500" />
          Contributed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-muted border" />
          Missed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-muted ring-2 ring-emerald-400" />
          Today
        </div>
      </div>
    </div>
  );
}

const DAY_PRESETS = [1, 2, 3, 5, 7, 14, 30];

function ContributionPaySection({
  email,
  dailyAmount,
  contributions,
  publicKey,
}: {
  email: string;
  dailyAmount: number;
  contributions: Contribution[];
  publicKey: string;
}) {
  const [selectedDays, setSelectedDays] = useState(1);

  const paidDates = getAllPaidDates(contributions);
  const today = todayStr();
  const paidToday = paidDates.has(today);

  // First unpaid day = today if not paid today, else tomorrow
  const startDate = paidToday ? addDays(today, 1) : today;

  // Build covered dates array
  const coveredDates: string[] = Array.from({ length: selectedDays }, (_, i) =>
    addDays(startDate, i)
  );

  // Count how many of the covered dates are already paid
  const alreadyPaid = coveredDates.filter((d) => paidDates.has(d)).length;

  const totalAmount = dailyAmount * selectedDays;

  const metadata: SquadMetadata = {
    coveredDates: JSON.stringify(coveredDates),
    daysCount: String(selectedDays),
  };

  return (
    <div className="space-y-4">
      {/* Paid-today badge */}
      {paidToday && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-600/10 border border-emerald-600/20 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Today&apos;s contribution is paid. You can pay ahead for future days below.
          </p>
        </div>
      )}

      {/* Day count selector */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Number of days to pay for
        </p>
        <div className="flex flex-wrap gap-2">
          {DAY_PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => setSelectedDays(n)}
              className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                selectedDays === n
                  ? "bg-emerald-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {n} {n === 1 ? "day" : "days"}
            </button>
          ))}
        </div>
      </div>

      {/* Dates breakdown */}
      <div className="rounded-xl bg-muted/50 border p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Dates being paid for
        </p>
        {selectedDays <= 5 ? (
          <ul className="space-y-1.5">
            {coveredDates.map((d) => (
              <li key={d} className="flex items-center justify-between text-sm">
                <span className={paidDates.has(d) ? "text-muted-foreground line-through" : ""}>
                  {fmtDate(d)}
                </span>
                <span className="text-xs">
                  {paidDates.has(d) ? (
                    <span className="text-amber-600 font-medium">Already paid</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">{naira(dailyAmount)}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm">
            <div className="flex items-center justify-between">
              <span>{fmtDate(coveredDates[0])}</span>
              <span className="text-xs text-muted-foreground">Start</span>
            </div>
            <div className="flex items-center justify-center my-1">
              <div className="flex flex-col items-center gap-0.5">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>{fmtDate(coveredDates[coveredDates.length - 1])}</span>
              <span className="text-xs text-muted-foreground">End</span>
            </div>
          </div>
        )}

        {alreadyPaid > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 pt-2 border-t border-border">
            ⚠️ {alreadyPaid} of these {alreadyPaid === 1 ? "day is" : "days are"} already paid — those days will not be double-counted.
          </p>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl bg-card border px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {naira(dailyAmount)} × {selectedDays} {selectedDays === 1 ? "day" : "days"}
          </p>
          <p className="text-lg font-bold mt-0.5">{naira(totalAmount)}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Total amount</p>
          <p className="mt-0.5">to be charged</p>
        </div>
      </div>

      {/* Pay button */}
      <SquadPayButton
        email={email}
        amount={totalAmount}
        publicKey={publicKey}
        metadata={metadata}
        onSuccess={() => {}}
      >
        Pay {naira(totalAmount)} for {selectedDays} {selectedDays === 1 ? "day" : "days"}
      </SquadPayButton>
    </div>
  );
}

export default function DashboardPageContent() {
  useUser();
  const me = useQuery(api.users.getMe);
  const contributions = useQuery(api.userContributions.getByUserId, {
    clerkUserId: me?.clerkUserId || "",
  });
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    fetch("/api/config/squad-public-key")
      .then((r) => r.json())
      .then((d) =>
        setPublicKey(typeof d.publicKey === "string" ? d.publicKey : "")
      )
      .catch(() => setPublicKey(""));
  }, []);

  if (me === undefined || contributions === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span className="text-sm">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Profile not found. Please complete onboarding.
        </p>
        <Link
          href="/onboarding"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-emerald-600 px-5 text-sm text-white hover:bg-emerald-700"
        >
          Complete Onboarding
        </Link>
      </div>
    );
  }

  if (!me.tier) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center mx-auto mb-4">
            <Banknote className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Choose Your Package</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select a savings package to start contributing and building towards
            your loan entitlement.
          </p>
          <Link
            href="/dashboard/select-package"
            className="inline-flex h-10 items-center rounded-lg bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Select Package
          </Link>
        </div>
      </div>
    );
  }

  const pkg = PACKAGE_CONFIG[me.tier as PackageId];
  const { Icon } = pkg;

  const typedContributions = contributions as Contribution[];

  const contributionDays = countUniqueDays(typedContributions);
  const lastPaymentDate = getLastPaymentTimestamp(typedContributions);
  const daysRemaining = Math.max(0, 90 - contributionDays);
  const isEligible = contributionDays >= 90;
  const progressPct = Math.min(100, Math.round((contributionDays / 90) * 100));
  const totalContributed = me.totalContributed || 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()},</p>
          <h1 className="text-xl sm:text-2xl font-bold mt-0.5">
            {me.fullName.split(" ")[0]} 👋
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            className={`${pkg.bg} ${pkg.color} ring-1 ${pkg.ring} capitalize border-0 text-sm px-3 py-1`}
          >
            <Icon className="h-3.5 w-3.5 mr-1.5" />
            {me.tier} Package
          </Badge>
        </div>
      </div>

      {/* ── Package selection prompt (shown after loan repayment) ── */}
      {me.canSelectPackage && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-3">
          <span className="text-xl mt-0.5">🎉</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              Your loan has been repaid — time to choose your next package!
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              You can continue with your current <span className="capitalize font-medium">{me.tier}</span> package or switch to a different one. This must be done before your next contribution cycle begins.
            </p>
            <Link
              href="/dashboard/select-package"
              className="inline-block mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Choose Package →
            </Link>
          </div>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">
            {contributionDays}
            <span className="text-sm text-muted-foreground font-normal">
              /90
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Days contributed
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tabular-nums">
            {naira(totalContributed)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Total saved</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${isEligible ? "bg-emerald-500/10" : "bg-amber-500/10"}`}
            >
              {isEligible ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <CalendarDays className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">
            {isEligible ? (
              <span className="text-emerald-600">Done!</span>
            ) : (
              <>
                {daysRemaining}
                <span className="text-sm text-muted-foreground font-normal">
                  {" "}
                  days
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {isEligible ? "Loan eligible" : "Days remaining"}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${pkg.bg}`}
            >
              <Banknote className={`h-4 w-4 ${pkg.color}`} />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold tabular-nums ${isEligible ? "text-emerald-600" : ""}`}
          >
            {naira(pkg.loan)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Loan entitlement
          </div>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">90-Day Progress</h2>
          <span className="text-sm font-medium">{contributionDays} / 90 days</span>
        </div>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
          <span>Day 0</span>
          <span className="text-emerald-600 font-medium">{progressPct}%</span>
          <span>Day 90</span>
        </div>

        {isEligible ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-600/10 border border-emerald-600/20 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Congratulations! You are loan eligible.
              </p>
              <p className="text-xs text-muted-foreground">
                You can now apply for up to {naira(pkg.loan)}.
              </p>
            </div>
            <Link
              href="/dashboard/loan"
              className="ml-auto text-xs font-medium text-emerald-600 hover:underline whitespace-nowrap"
            >
              Apply now →
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            {daysRemaining} more day{daysRemaining !== 1 ? "s" : ""} of
            contributions to unlock your{" "}
            <span className="font-medium text-foreground">
              {naira(pkg.loan)}
            </span>{" "}
            loan entitlement.
          </p>
        )}
      </div>

      {/* ── Daily Contribution ── */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold">Daily Contribution</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {naira(pkg.daily)}/day · pay today or multiple days ahead
            </p>
          </div>
        </div>
        <ContributionPaySection
          email={me.email}
          dailyAmount={pkg.daily}
          contributions={typedContributions}
          publicKey={publicKey}
        />
        {lastPaymentDate && (
          <p className="mt-4 text-xs text-muted-foreground border-t pt-3">
            Last payment:{" "}
            {new Date(lastPaymentDate).toLocaleDateString("en-NG", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {/* ── Contribution Calendar ── */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Contribution Calendar</h2>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <ContributionCalendar contributions={typedContributions} />
      </div>

      {/* ── Transaction History ── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">Contribution History</h2>
          <span className="text-xs text-muted-foreground">
            {contributions.length} payment
            {contributions.length !== 1 ? "s" : ""}
          </span>
        </div>
        {contributions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No contributions yet. Make your first payment above!
          </div>
        ) : (
          <div className="divide-y">
            {contributions.slice(0, 20).map((c: Contribution) => {
              const tc = c;
              let daysLabel = "";
              if (tc.meta?.coveredDates) {
                try {
                  const covered = JSON.parse(tc.meta.coveredDates as string) as string[];
                  if (Array.isArray(covered) && covered.length > 1) {
                    daysLabel = ` · ${covered.length} days`;
                  }
                } catch { /* ignore */ }
              }
              return (
                <div
                  key={tc._id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        tc.transactionStatus.toLowerCase() === "success"
                          ? "bg-emerald-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {tc.transactionStatus.toLowerCase() === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Daily Contribution{daysLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tc.processedAt).toLocaleDateString("en-NG", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        tc.transactionStatus.toLowerCase() === "success"
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {naira(tc.amount / 100)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {tc.transactionStatus}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
