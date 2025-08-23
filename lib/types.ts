export type CategoryId = "bronze" | "silver" | "gold" | "diamond" | "emerald";

export type MembershipCategory = {
  id: CategoryId;
  name: string;
  dailyContributionNaira: number;
  durationDays: number; // default: 90
  loanEntitlementNaira: number;
};

export type Transaction = {
  id: string;
  type: "fund" | "contribution" | "withdrawal" | "loan";
  amountNaira: number;
  createdAtIso: string;
  note?: string;
};

export type Contribution = {
  id: string;
  categoryId: CategoryId;
  amountNaira: number;
  contributedAtIso: string;
};

export type Goal = {
  id: string;
  title: string;
  targetAmountNaira: number;
  createdAtIso: string;
};

export type UserProfile = {
  email: string;
  password: string;
  status: "pending" | "verified" | "rejected";
  createdAtIso: string;
  categoryId?: CategoryId;
  joinDateIso?: string; // set when category chosen
  isFrozen?: boolean;
  // For future Convex/Clerk parity
  verified?: boolean; // mirrors status === "verified"
  category?: CategoryId; // mirrors categoryId
};

export type Wallet = {
  balanceNaira: number;
};

export type MockData = {
  user?: UserProfile;
  wallet: Wallet;
  transactions: Transaction[];
  contributions: Contribution[];
  goals: Goal[];
};
