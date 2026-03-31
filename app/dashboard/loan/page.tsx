"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Award,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock,
  Diamond,
  Gem,
  Lock,
  Medal,
  Trophy,
  XCircle,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

type PackageId = "bronze" | "silver" | "gold" | "diamond" | "emerald";

const PACKAGE_LOANS: Record<PackageId, number> = {
  bronze: 100_000,
  silver: 180_000,
  gold: 360_000,
  diamond: 1_000_000,
  emerald: 2_000_000,
};

const PACKAGE_ICONS: Record<PackageId, React.ElementType> = {
  bronze: Medal,
  silver: Award,
  gold: Trophy,
  diamond: Diamond,
  emerald: Gem,
};

function naira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

function countUniqueDays(
  contributions: Array<{ processedAt: number; transactionStatus: string }>
): number {
  const dates = new Set(
    contributions
      .filter((c) => c.transactionStatus.toLowerCase() === "success")
      .map((c) => new Date(c.processedAt).toISOString().split("T")[0])
  );
  return dates.size;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { classes: string; Icon: React.ElementType }> = {
    pending: {
      classes: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      Icon: Clock,
    },
    approved: {
      classes: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      Icon: CheckCircle2,
    },
    rejected: {
      classes: "bg-red-500/10 text-red-600 border-red-500/20",
      Icon: XCircle,
    },
  };
  const v = variants[status] || variants.pending;
  return (
    <Badge className={`${v.classes} border gap-1.5 capitalize`}>
      <v.Icon className="h-3.5 w-3.5" />
      {status}
    </Badge>
  );
}

export default function LoanPage() {
  const me = useQuery(api.users.getMe);
  const contributions = useQuery(api.userContributions.getByUserId, {
    clerkUserId: me?.clerkUserId || "",
  });
  const loanApplications = useQuery(api.loanApplications.getUserLoanApplications);
  const createLoan = useMutation(api.loanApplications.createLoanApplication);

  const [submitting, setSubmitting] = React.useState(false);
  const [employmentStatus, setEmploymentStatus] = React.useState("");
  const [repaymentPeriod, setRepaymentPeriod] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);

  const loading =
    me === undefined || contributions === undefined || loanApplications === undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const contributionDays = countUniqueDays(contributions || []);
  const isEligible = contributionDays >= 90;
  const daysRemaining = Math.max(0, 90 - contributionDays);
  const progressPct = Math.min(100, Math.round((contributionDays / 90) * 100));
  const maxLoan = me?.tier ? PACKAGE_LOANS[me.tier as PackageId] || 0 : 0;
  const PackageIcon = me?.tier ? PACKAGE_ICONS[me.tier as PackageId] : Banknote;

  const pendingApp = loanApplications?.find((a) => a.status === "pending");
  const approvedApp = loanApplications?.find((a) => a.status === "approved");
  const hasActiveLoan = !!pendingApp || !!approvedApp;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const loanAmount = Number(fd.get("loanAmount") || 0);
    const loanPurpose = String(fd.get("loanPurpose") || "");
    const monthlyIncome = Number(fd.get("monthlyIncome") || 0);
    const employerName = String(fd.get("employerName") || "");
    const employerAddress = String(fd.get("employerAddress") || "");
    const guarantorName = String(fd.get("guarantorName") || "");
    const guarantorPhone = String(fd.get("guarantorPhone") || "");
    const guarantorAddress = String(fd.get("guarantorAddress") || "");
    const guarantorRelationship = String(fd.get("guarantorRelationship") || "");

    if (!loanAmount || loanAmount > maxLoan) {
      toast.error(`Loan amount must be between ₦1 and ${naira(maxLoan)}`);
      return;
    }
    if (!loanPurpose) { toast.error("Loan purpose is required"); return; }
    if (!repaymentPeriod) { toast.error("Repayment period is required"); return; }
    if (!employmentStatus) { toast.error("Employment status is required"); return; }
    if (!monthlyIncome) { toast.error("Monthly income is required"); return; }
    if (!guarantorName || !guarantorPhone || !guarantorAddress || !guarantorRelationship) {
      toast.error("All guarantor fields are required"); return;
    }

    setSubmitting(true);
    try {
      await createLoan({
        loanAmount,
        loanPurpose,
        repaymentPeriod: Number(repaymentPeriod),
        monthlyIncome,
        employmentStatus,
        employerName: employerName || undefined,
        employerAddress: employerAddress || undefined,
        guarantorName,
        guarantorPhone,
        guarantorAddress,
        guarantorRelationship,
      });
      toast.success("Loan application submitted! We'll review it within 3–5 business days.");
      setShowForm(false);
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Loan Access</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete 90 days of contributions to unlock your loan entitlement.
        </p>
      </div>

      {/* Eligibility Card */}
      <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${isEligible ? "bg-emerald-600/5 border-emerald-600/20" : "bg-card"}`}>
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isEligible ? "bg-emerald-600" : "bg-muted"}`}>
            {isEligible ? (
              <CheckCircle2 className="h-6 w-6 text-white" />
            ) : (
              <Lock className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-lg">
                {isEligible ? "You're Eligible!" : "Loan Locked"}
              </h2>
              {me?.tier && (
                <Badge className="bg-muted text-muted-foreground border-0 capitalize gap-1.5">
                  <PackageIcon className="h-3.5 w-3.5" />
                  {me.tier} Package
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isEligible
                ? `You have completed ${contributionDays} days of contributions. You can now apply for up to ${naira(maxLoan)}.`
                : `You need ${daysRemaining} more day${daysRemaining !== 1 ? "s" : ""} of contributions to unlock your ${naira(maxLoan)} loan entitlement.`}
            </p>

            {/* Progress bar */}
            {!isEligible && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{contributionDays} days contributed</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Day 0</span>
                  <span>Day 90</span>
                </div>
              </div>
            )}

            {isEligible && !hasActiveLoan && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex h-10 items-center rounded-xl bg-emerald-600 px-5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                Apply for Loan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loan Summary */}
      {me?.tier && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border bg-card p-4 shadow-sm text-center">
            <CalendarDays className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
            <div className="text-xl font-bold">{contributionDays}</div>
            <div className="text-xs text-muted-foreground">Days contributed</div>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-sm text-center">
            <Banknote className="h-5 w-5 text-blue-600 mx-auto mb-2" />
            <div className="text-xl font-bold">{naira(maxLoan)}</div>
            <div className="text-xs text-muted-foreground">Max loan</div>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-sm text-center">
            <Clock className="h-5 w-5 text-amber-600 mx-auto mb-2" />
            <div className="text-xl font-bold">
              {isEligible ? "Ready" : `${daysRemaining}d`}
            </div>
            <div className="text-xs text-muted-foreground">
              {isEligible ? "Apply now" : "Days left"}
            </div>
          </div>
        </div>
      )}

      {/* Existing Applications */}
      {loanApplications && loanApplications.length > 0 && (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold">Loan Applications</h2>
          </div>
          <div className="divide-y">
            {loanApplications.map((app) => (
              <div key={app._id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {naira(app.loanAmount)}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {app.loanPurpose} · {app.repaymentPeriod} months
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied:{" "}
                      {new Date(app.submittedAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {app.reviewNotes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Note: {app.reviewNotes}
                      </p>
                    )}
                  </div>
                  {app.status === "approved" && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">
                        Reviewed:{" "}
                        {app.reviewedAt
                          ? new Date(app.reviewedAt).toLocaleDateString("en-NG", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loan Application Form */}
      {isEligible && showForm && (
        <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">Loan Application</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl bg-emerald-600/5 border border-emerald-600/20 p-4 text-sm">
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                Maximum loan: {naira(maxLoan)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on your {me?.tier} package. You may apply for any amount up to this limit.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Loan amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₦</span>
                  <Input
                    name="loanAmount"
                    type="number"
                    min={1}
                    max={maxLoan}
                    placeholder={`Max ${naira(maxLoan)}`}
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label>Repayment period *</Label>
                <Select value={repaymentPeriod} onValueChange={setRepaymentPeriod}>
                  <SelectTrigger><SelectValue placeholder="Select months" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="9">9 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Loan purpose *</Label>
                <Textarea name="loanPurpose" rows={2} placeholder="Brief description of loan purpose" />
              </div>
              <div>
                <Label>Employment status *</Label>
                <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self_employed">Self-employed</SelectItem>
                    <SelectItem value="business_owner">Business owner</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Monthly income (₦) *</Label>
                <Input name="monthlyIncome" type="number" min={0} placeholder="0" />
              </div>
              <div>
                <Label>Employer name</Label>
                <Input name="employerName" placeholder="Optional" />
              </div>
              <div>
                <Label>Employer address</Label>
                <Input name="employerAddress" placeholder="Optional" />
              </div>
            </div>

            <div className="pt-2 border-t">
              <h3 className="font-medium mb-3">Guarantor Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Full name *</Label>
                  <Input name="guarantorName" />
                </div>
                <div>
                  <Label>Phone number *</Label>
                  <Input name="guarantorPhone" type="tel" />
                </div>
                <div>
                  <Label>Relationship *</Label>
                  <Input name="guarantorRelationship" placeholder="e.g. Brother, Friend" />
                </div>
                <div>
                  <Label>Address *</Label>
                  <Input name="guarantorAddress" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Locked state info */}
      {!isEligible && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">How to unlock your loan</p>
          <ul className="space-y-1.5 list-none">
            {[
              "Make your daily contribution every day",
              "Each unique calendar day with a successful payment counts",
              "Missing a day does not erase previous days",
              "After 90 unique contribution days, your loan is unlocked",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
