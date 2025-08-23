import dayjs from "dayjs";
import type { CategoryId, MembershipCategory, MockData } from "./types";

export const MEMBERSHIP_CATEGORIES: MembershipCategory[] = [
  {
    id: "bronze",
    name: "Bronze",
    dailyContributionNaira: 500,
    durationDays: 90,
    loanEntitlementNaira: 100_000,
  },
  {
    id: "silver",
    name: "Silver",
    dailyContributionNaira: 1_000,
    durationDays: 90,
    loanEntitlementNaira: 180_000,
  },
  {
    id: "gold",
    name: "Gold",
    dailyContributionNaira: 2_000,
    durationDays: 90,
    loanEntitlementNaira: 360_000,
  },
  {
    id: "diamond",
    name: "Diamond",
    dailyContributionNaira: 5_000,
    durationDays: 90,
    loanEntitlementNaira: 1_000_000,
  },
  {
    id: "emerald",
    name: "Emerald",
    dailyContributionNaira: 10_000,
    durationDays: 90,
    loanEntitlementNaira: 2_000_000,
  },
];

export function findCategoryById(
  categoryId: CategoryId | undefined
): MembershipCategory | undefined {
  if (!categoryId) return undefined;
  return MEMBERSHIP_CATEGORIES.find((c) => c.id === categoryId);
}

export function isLoanEligible(
  joinDateIso: string | undefined,
  requiredDays = 90
): boolean {
  if (!joinDateIso) return false;
  const joined = dayjs(joinDateIso);
  return dayjs().diff(joined, "day") >= requiredDays;
}

export function remainingDays(
  joinDateIso: string | undefined,
  requiredDays = 90
): number {
  if (!joinDateIso) return requiredDays;
  const diff = requiredDays - dayjs().diff(dayjs(joinDateIso), "day");
  return diff > 0 ? diff : 0;
}

export function naira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const DEFAULT_MOCK_DATA: MockData = {
  wallet: { balanceNaira: 0 },
  transactions: [],
  contributions: [],
  goals: [],
};
