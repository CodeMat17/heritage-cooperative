"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Award,
  Banknote,
  CheckCircle2,
  Diamond,
  Gem,
  Medal,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const PACKAGES = [
  {
    id: "bronze" as const,
    name: "Bronze",
    daily: 500,
    loan: 100_000,
    icon: Medal,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    blurb: "Build the savings habit with a manageable daily commitment.",
  },
  {
    id: "silver" as const,
    name: "Silver",
    daily: 1_000,
    loan: 180_000,
    icon: Award,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    ring: "ring-slate-400/20",
    blurb: "A balanced plan for steady savers looking for bigger returns.",
  },
  {
    id: "gold" as const,
    name: "Gold",
    daily: 2_000,
    loan: 360_000,
    icon: Trophy,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    ring: "ring-yellow-500/20",
    blurb: "Accelerate your wealth-building with double the momentum.",
    popular: true,
  },
  {
    id: "diamond" as const,
    name: "Diamond",
    daily: 5_000,
    loan: 1_000_000,
    icon: Diamond,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    ring: "ring-sky-400/20",
    blurb: "High-capacity plan for members with ambitious financial goals.",
  },
  {
    id: "emerald" as const,
    name: "Emerald",
    daily: 10_000,
    loan: 2_000_000,
    icon: Gem,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    blurb: "The elite tier — maximum savings for maximum leverage.",
  },
];

function naira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function SelectPackagePage() {
  const me = useQuery(api.users.getMe);
  const setUserTier = useMutation(api.users.setUserTier);
  const confirmContinue = useMutation(api.users.confirmContinuePackage);
  const router = useRouter();

  const [submittingId, setSubmittingId] = React.useState<string | null>(null);
  const [confirmed, setConfirmed] = React.useState<string | null>(null);
  const [continuingPackage, setContinuingPackage] = React.useState(false);

  if (me === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const isFirstTime = !me?.tier;
  const currentTier = me?.tier;

  // Access guard: returning users may only be here when canSelectPackage is set
  if (!isFirstTime && !me?.canSelectPackage) {
    router.replace("/dashboard");
    return null;
  }

  async function handleSelect(packageId: string) {
    if (confirmed === packageId) {
      try {
        setSubmittingId(packageId);
        await setUserTier({ tier: packageId });
        toast.success(
          `${packageId.charAt(0).toUpperCase() + packageId.slice(1)} package ${isFirstTime ? "activated" : "selected"}!`
        );
        router.replace("/dashboard");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to set package.");
      } finally {
        setSubmittingId(null);
        setConfirmed(null);
      }
    } else {
      setConfirmed(packageId);
    }
  }

  async function handleContinue() {
    try {
      setContinuingPackage(true);
      await confirmContinue({});
      toast.success("Continuing with your current package. Your new cycle begins now.");
      router.replace("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setContinuingPackage(false);
    }
  }

  const currentPkg = PACKAGES.find((p) => p.id === currentTier);
  const CurrentIcon = currentPkg?.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="h-14 w-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center mx-auto mb-4">
          <Banknote className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {isFirstTime ? "Choose Your Savings Package" : "Choose Your Next Package"}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm">
          {isFirstTime
            ? "Select the package that matches your daily savings capacity. You'll contribute this amount every day for 90 days to unlock your loan."
            : "Your loan has been repaid. Select a package for your next savings cycle, or continue with your current one."}
        </p>
      </div>

      {/* Continue with current package (returning users only) */}
      {!isFirstTime && currentPkg && CurrentIcon && (
        <div
          className={`mb-8 rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${currentPkg.bg} border-${currentPkg.ring.replace("ring-", "")}`}
        >
          <div
            className={`h-12 w-12 rounded-xl ${currentPkg.bg} ring-1 ${currentPkg.ring} flex items-center justify-center flex-shrink-0`}
          >
            <CurrentIcon className={`h-6 w-6 ${currentPkg.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
              Current package
            </p>
            <p className="font-bold text-lg capitalize">{currentPkg.name}</p>
            <p className="text-sm text-muted-foreground">
              {naira(currentPkg.daily)}/day · {naira(currentPkg.loan)} loan entitlement
            </p>
          </div>
          <button
            disabled={continuingPackage}
            onClick={handleContinue}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            {continuingPackage ? "Confirming…" : "Continue with this package"}
          </button>
        </div>
      )}

      {/* Package Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PACKAGES.map((pkg) => {
          const isCurrent = pkg.id === currentTier;
          const isConfirming = confirmed === pkg.id;
          const isSubmitting = submittingId === pkg.id;

          return (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border bg-card p-5 shadow-sm transition-all ${
                isConfirming
                  ? "ring-2 ring-amber-500 border-amber-500/30"
                  : "hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              } ${pkg.popular ? "lg:scale-105" : ""}`}
              onClick={() => !isSubmitting && handleSelect(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrent && !isFirstTime && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-slate-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    Current
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-xl ${pkg.bg} ring-1 ${pkg.ring} flex items-center justify-center`}
                >
                  <pkg.icon className={`h-6 w-6 ${pkg.color}`} />
                </div>
                {isConfirming && (
                  <span className="text-xs text-amber-600 font-medium animate-pulse">
                    Click to confirm
                  </span>
                )}
              </div>

              <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {pkg.blurb}
              </p>

              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily</span>
                  <span className="font-semibold">{naira(pkg.daily)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold">90 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan entitlement</span>
                  <span className="font-semibold text-emerald-600">
                    {naira(pkg.loan)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total to save</span>
                  <span className="font-semibold">{naira(pkg.daily * 90)}</span>
                </div>
              </div>

              <button
                disabled={isSubmitting}
                className={`w-full h-10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  isConfirming
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : `${pkg.bg} ${pkg.color} ring-1 ${pkg.ring} hover:opacity-80`
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  "Applying…"
                ) : isConfirming ? (
                  `Confirm — ${pkg.name}`
                ) : (
                  <>
                    {isFirstTime ? "Select" : "Switch to"} {pkg.name}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground mt-8 max-w-xl mx-auto">
        All packages require 90 days of consistent daily contributions to qualify for a loan. Missed days do not count.
      </p>
    </div>
  );
}
