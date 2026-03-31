"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import {
  Award,
  BadgePercent,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronDown,
  Diamond,
  Gem,
  Medal,
  Moon,
  ShieldCheck,
  Sun,
  Trophy,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";

const PACKAGES = [
  {
    id: "bronze",
    name: "Bronze",
    daily: 500,
    loan: 100_000,
    icon: Medal,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    border: "border-amber-500/30",
    blurb: "Start small and build the savings habit.",
  },
  {
    id: "silver",
    name: "Silver",
    daily: 1_000,
    loan: 180_000,
    icon: Award,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    ring: "ring-slate-400/20",
    border: "border-slate-400/30",
    blurb: "Balanced plan for steady savers.",
  },
  {
    id: "gold",
    name: "Gold",
    daily: 2_000,
    loan: 360_000,
    icon: Trophy,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    ring: "ring-yellow-500/20",
    border: "border-yellow-500/30",
    blurb: "Double your momentum towards bigger goals.",
    popular: true,
  },
  {
    id: "diamond",
    name: "Diamond",
    daily: 5_000,
    loan: 1_000_000,
    icon: Diamond,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    ring: "ring-sky-400/20",
    border: "border-sky-400/30",
    blurb: "High-capacity savings for ambitious targets.",
  },
  {
    id: "emerald",
    name: "Emerald",
    daily: 10_000,
    loan: 2_000_000,
    icon: Gem,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    border: "border-emerald-500/30",
    blurb: "Elite savings for maximum leverage.",
  },
];

const FAQS = [
  {
    q: "How does Heritage Cooperative work?",
    a: "You select a savings package, contribute your daily amount for 90 consecutive days, and then become eligible to access a loan equal to your package's entitlement.",
  },
  {
    q: "Can I change my package after selecting one?",
    a: "Your package is fixed once contributions begin. Contact our support team if you need an upgrade reviewed by the admin.",
  },
  {
    q: "How is the loan amount determined?",
    a: "Each package has a fixed loan entitlement. After completing 90 days of contributions, you can apply for up to your package's maximum loan amount.",
  },
  {
    q: "What payment methods are supported?",
    a: "We accept all major Nigerian cards, bank transfers, and USSD payments through our secure Squadco payment gateway.",
  },
  {
    q: "How long does loan approval take?",
    a: "Loan applications are reviewed within 3–5 business days after submission. You will be notified via your registered email.",
  },
  {
    q: "Is my money safe?",
    a: "Heritage Multipurpose Cooperative Society is a registered cooperative operating under Nigerian cooperative law. All payments are processed via PCI-DSS compliant Squadco infrastructure.",
  },
];

function naira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-emerald-600 transition-colors"
      >
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const { isSignedIn, sessionClaims } = useAuth();
  const { theme, setTheme } = useTheme();
  const isOnboardingComplete = sessionClaims?.metadata?.onboardingComplete;

  const [calcIndex, setCalcIndex] = useState(2);
  const pkg = PACKAGES[calcIndex];
  const totalAfter90 = pkg.daily * 90;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base">
              Heritage Cooperative
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#packages" className="text-muted-foreground hover:text-foreground transition-colors">
              Packages
            </a>
            <a href="#calculator" className="text-muted-foreground hover:text-foreground transition-colors">
              Calculator
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 flex items-center justify-center rounded-md border hover:bg-muted transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            {isSignedIn && isOnboardingComplete ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : isSignedIn ? (
              <Button asChild size="sm">
                <Link href="/onboarding">Complete Setup</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/sign-up">Get started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/20 hover:bg-emerald-600/10">
            Registered Cooperative Society · Nigeria
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Save Daily.{" "}
            <span className="text-emerald-600">Build Wealth.</span>{" "}
            Access Loans.
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Heritage Multipurpose Cooperative helps you develop a consistent
            savings habit and rewards you with loan access after 90 days of
            contribution.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            {isSignedIn && isOnboardingComplete ? (
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/sign-up">Start Saving Today</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#packages">View Packages</a>
                </Button>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-6 pt-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              No hidden charges
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Secure payments
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              90-day loan access
            </div>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: Users,
              label: "Active Members",
              value: "500+",
              color: "text-emerald-600",
              bg: "bg-emerald-500/10",
            },
            {
              icon: Wallet,
              label: "Total Saved",
              value: "₦50M+",
              color: "text-blue-600",
              bg: "bg-blue-500/10",
            },
            {
              icon: TrendingUp,
              label: "Loans Disbursed",
              value: "₦120M+",
              color: "text-amber-600",
              bg: "bg-amber-500/10",
            },
            {
              icon: ShieldCheck,
              label: "Years Active",
              value: "5+",
              color: "text-purple-600",
              bg: "bg-purple-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div
                className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="bg-muted/40 border-y py-16 sm:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Three simple steps from sign-up to loan access.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* connector line desktop */}
            <div className="hidden sm:block absolute top-10 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-border" />
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up and complete your KYC onboarding in minutes. Your data is secured and encrypted.",
                icon: Users,
                color: "bg-emerald-600",
              },
              {
                step: "02",
                title: "Choose a Package",
                desc: "Select from 5 packages (Bronze to Emerald) based on your daily savings capacity.",
                icon: Banknote,
                color: "bg-emerald-600",
              },
              {
                step: "03",
                title: "Save & Unlock Loan",
                desc: "Contribute your daily amount for 90 days to unlock your loan entitlement.",
                icon: BadgePercent,
                color: "bg-emerald-600",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center relative z-10">
                <div className={`h-20 w-20 rounded-2xl ${item.color} flex items-center justify-center shadow-lg mb-4`}>
                  <item.icon className="h-9 w-9 text-white" />
                </div>
                <div className="text-xs font-bold text-emerald-600 mb-1 tracking-widest">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Savings Packages
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Choose the package that fits your daily savings capacity. All packages unlock a loan after 90 days.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                pkg.popular ? "ring-2 ring-emerald-600" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white text-xs px-3">
                    Most Popular
                  </Badge>
                </div>
              )}
              <div
                className={`h-12 w-12 rounded-xl ${pkg.bg} ring-1 ${pkg.ring} flex items-center justify-center mb-4`}
              >
                <pkg.icon className={`h-6 w-6 ${pkg.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{pkg.blurb}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Daily</span>
                  <span className="font-semibold">{naira(pkg.daily)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold">90 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Loan</span>
                  <span className="font-semibold text-emerald-600">
                    {naira(pkg.loan)}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  asChild
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
                  size="sm"
                >
                  <Link href="/sign-up">
                    Get started
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Calculator ── */}
      <section
        id="calculator"
        className="bg-muted/40 border-y py-16 sm:py-20"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Savings Calculator
            </h2>
            <p className="text-muted-foreground mt-2">
              Slide to preview your 90-day savings and loan entitlement.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Daily contribution
              </span>
              <span className="text-2xl font-bold text-emerald-600">
                {naira(pkg.daily)}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={PACKAGES.length - 1}
              step={1}
              value={calcIndex}
              onChange={(e) => setCalcIndex(Number(e.target.value))}
              className="w-full accent-emerald-600 mb-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground mb-6">
              {PACKAGES.map((p) => (
                <span key={p.id}>{naira(p.daily)}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-muted/60 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  After 90 days
                </div>
                <div className="font-bold text-lg">{naira(totalAfter90)}</div>
                <div className="text-xs text-muted-foreground">saved</div>
              </div>
              <div className="rounded-xl bg-muted/60 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Package
                </div>
                <div className="font-bold text-lg capitalize">{pkg.name}</div>
                <div className="text-xs text-muted-foreground">tier</div>
              </div>
              <div className="rounded-xl bg-emerald-600/10 border border-emerald-600/20 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Loan access
                </div>
                <div className="font-bold text-lg text-emerald-600">
                  {naira(pkg.loan)}
                </div>
                <div className="text-xs text-muted-foreground">entitlement</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/sign-up">
                  Start with {pkg.name} — {naira(pkg.daily)}/day
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Heritage ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Why Heritage Cooperative?
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Legally Registered",
              desc: "Registered under Nigerian cooperative law. Your contributions are protected.",
              color: "text-emerald-600",
              bg: "bg-emerald-500/10",
            },
            {
              icon: Banknote,
              title: "Flexible Loan Access",
              desc: "Unlock loans up to ₦2,000,000 based on your package after 90 days.",
              color: "text-blue-600",
              bg: "bg-blue-500/10",
            },
            {
              icon: TrendingUp,
              title: "Track Your Progress",
              desc: "Real-time dashboard showing contribution days, total saved, and loan eligibility.",
              color: "text-amber-600",
              bg: "bg-amber-500/10",
            },
            {
              icon: BadgePercent,
              title: "No Collateral",
              desc: "Access cooperative loans without physical collateral — your contribution record is enough.",
              color: "text-purple-600",
              bg: "bg-purple-500/10",
            },
            {
              icon: Users,
              title: "Community Driven",
              desc: "A cooperative model where members support each other's financial growth.",
              color: "text-rose-600",
              bg: "bg-rose-500/10",
            },
            {
              icon: Wallet,
              title: "Secure Payments",
              desc: "All transactions processed via Squadco — PCI-DSS compliant payment infrastructure.",
              color: "text-teal-600",
              bg: "bg-teal-500/10",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div
                className={`h-11 w-11 rounded-xl ${item.bg} flex items-center justify-center mb-4`}
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section id="faq" className="bg-muted/40 border-y py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="rounded-2xl border bg-card px-6 divide-y shadow-sm">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <div className="rounded-3xl bg-emerald-600 p-10 sm:p-14 text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to start saving?
          </h2>
          <p className="text-emerald-100 max-w-lg mx-auto mb-8">
            Join hundreds of Nigerians already building wealth daily through
            Heritage Cooperative.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50"
            >
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-emerald-300 text-white hover:bg-emerald-700"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-sm">Heritage Cooperative</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Heritage Multipurpose Cooperative Society — empowering
                Nigerians through disciplined savings.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#how-it-works" className="hover:text-foreground">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#packages" className="hover:text-foreground">
                    Packages
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="hover:text-foreground">
                    Calculator
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/sign-in" className="hover:text-foreground">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-foreground">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              © {new Date().getFullYear()} Heritage Multipurpose Cooperative
              Society. All rights reserved.
            </span>
            <span>RC No. CAC/IT/012345 · Lagos, Nigeria</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
