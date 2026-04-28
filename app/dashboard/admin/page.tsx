"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  Award,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  Diamond,
  Eye,
  FileText,
  Gem,
  Medal,
  Search,
  Trophy,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type PackageId = "bronze" | "silver" | "gold" | "diamond" | "emerald";

const PACKAGE_COLORS: Record<PackageId, string> = {
  bronze: "text-amber-600 bg-amber-500/10",
  silver: "text-slate-400 bg-slate-400/10",
  gold: "text-yellow-500 bg-yellow-500/10",
  diamond: "text-sky-400 bg-sky-400/10",
  emerald: "text-emerald-500 bg-emerald-500/10",
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

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function LoanStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  return (
    <Badge className={`${map[status] || map.pending} border capitalize text-xs`}>
      {status}
    </Badge>
  );
}

type Tab = "users" | "loans";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [userSearch, setUserSearch] = useState("");
  const [loanSearch, setLoanSearch] = useState("");
  const [loanFilter, setLoanFilter] = useState("all");
  const [reviewingId, setReviewingId] = useState<Id<"loanApplications"> | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const users = useQuery(api.users.getAllUsers);
  const loans = useQuery(api.loanApplications.getAllLoanApplications, {
    status: loanFilter === "all" ? undefined : loanFilter,
  });
  const updateLoanStatus = useMutation(api.loanApplications.updateLoanApplicationStatus);

  // users is null when the JWT role claim is missing — show a reload prompt
  if (users === null) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Session is still initialising. Please wait a moment and reload.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-emerald-600 underline underline-offset-2"
        >
          Reload now
        </button>
      </div>
    );
  }

  const filteredUsers = users?.filter((u: Doc<"users">) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.mobilePhoneNumber?.includes(q) ||
      u.tier?.toLowerCase().includes(q)
    );
  });

  const filteredLoans = loans?.filter((l: Doc<"loanApplications">) => {
    if (!loanSearch) return true;
    const q = loanSearch.toLowerCase();
    return (
      l.fullName.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.loanPurpose.toLowerCase().includes(q)
    );
  });

  const reviewingLoan = loans?.find((l: Doc<"loanApplications">) => l._id === reviewingId);

  async function handleLoanAction(status: "approved" | "rejected") {
    if (!reviewingId) return;
    try {
      await updateLoanStatus({ id: reviewingId, status, reviewNotes: reviewNotes || undefined });
      toast.success(`Loan ${status}`);
      setReviewingId(null);
      setReviewNotes("");
    } catch {
      toast.error("Failed to update loan status");
    }
  }

  const statsCards = [
    {
      label: "Total Members",
      value: users?.length ?? "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "With Package",
      value: users?.filter((u: Doc<"users">) => u.tier).length ?? "—",
      icon: Banknote,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pending Loans",
      value: loans?.filter((l: Doc<"loanApplications">) => l.status === "pending").length ?? "—",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: "Approved Loans",
      value: loans?.filter((l: Doc<"loanApplications">) => l.status === "approved").length ?? "—",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage members and loan applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["users", "loans"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
              tab === t
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "users" ? <Users className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            {t === "users" ? "Members" : "Loan Applications"}
          </button>
        ))}
      </div>

      {/* ── Users Tab ── */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone or package…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10"
            />
            {userSearch && (
              <button
                onClick={() => setUserSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Showing {filteredUsers?.length ?? 0} of {users?.length ?? 0} members
          </div>

          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {!filteredUsers || filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No members found.
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((u: Doc<"users">) => {
                  const PkgIcon = u.tier ? PACKAGE_ICONS[u.tier as PackageId] : null;
                  const pkgColor = u.tier ? PACKAGE_COLORS[u.tier as PackageId] : "";
                  return (
                    <div
                      key={u._id}
                      className="flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-muted/40 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{u.fullName}</p>
                          {u.tier && PkgIcon && (
                            <Badge className={`${pkgColor} border-0 text-xs capitalize gap-1`}>
                              <PkgIcon className="h-3 w-3" />
                              {u.tier}
                            </Badge>
                          )}
                          {!u.tier && (
                            <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                              No package
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.email} · {u.mobilePhoneNumber}
                        </p>
                        {u.totalContributed !== undefined && u.totalContributed > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Saved: {naira(u.totalContributed)}
                          </p>
                        )}
                      </div>
                      <Button asChild variant="ghost" size="sm" className="flex-shrink-0">
                        <Link href={`/dashboard/admin/user/${u._id}`}>
                          <Eye className="h-4 w-4 mr-1.5" />
                          View
                          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Loans Tab ── */}
      {tab === "loans" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or purpose…"
                value={loanSearch}
                onChange={(e) => setLoanSearch(e.target.value)}
                className="pl-10"
              />
              {loanSearch && (
                <button
                  onClick={() => setLoanSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={loanFilter} onValueChange={setLoanFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing {filteredLoans?.length ?? 0} application{filteredLoans?.length !== 1 ? "s" : ""}
          </div>

          {/* Review Panel */}
          {reviewingId && reviewingLoan && (
            <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Reviewing: {reviewingLoan.fullName}</h3>
                <button
                  onClick={() => { setReviewingId(null); setReviewNotes(""); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Applicant</p>
                  <p className="font-medium">{reviewingLoan.fullName}</p>
                  <p className="text-muted-foreground">{reviewingLoan.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Loan Details</p>
                  <p className="font-medium">{naira(reviewingLoan.loanAmount)}</p>
                  <p className="text-muted-foreground">{reviewingLoan.repaymentPeriod} months · {reviewingLoan.loanPurpose}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Employment</p>
                  <p className="font-medium capitalize">{reviewingLoan.employmentStatus}</p>
                  <p className="text-muted-foreground">Income: {naira(reviewingLoan.monthlyIncome)}/month</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Guarantor</p>
                  <p className="font-medium">{reviewingLoan.guarantorName}</p>
                  <p className="text-muted-foreground">{reviewingLoan.guarantorPhone} · {reviewingLoan.guarantorRelationship}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Review notes (optional)</label>
                <Textarea
                  placeholder="Add notes for the applicant…"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-1.5"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleLoanAction("approved")}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleLoanAction("rejected")}
                  variant="destructive"
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {!filteredLoans || filteredLoans.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No loan applications found.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredLoans.map((loan: Doc<"loanApplications">) => (
                  <div
                    key={loan._id}
                    className="flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{loan.fullName}</p>
                        <LoanStatusBadge status={loan.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {loan.email}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{naira(loan.loanAmount)}</span>
                        <span>{loan.repaymentPeriod} months</span>
                        <span>{loan.loanPurpose}</span>
                        <span>Applied {fmtDate(loan.submittedAt)}</span>
                      </div>
                    </div>
                    {loan.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 text-xs"
                        onClick={() => {
                          setReviewingId(loan._id);
                          setReviewNotes("");
                        }}
                      >
                        Review
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
