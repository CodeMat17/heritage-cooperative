"use client";

import dayjs from "dayjs";
import { DEFAULT_MOCK_DATA } from "./mock";
import type {
  Contribution,
  Goal,
  MockData,
  Transaction,
  UserProfile,
  Wallet,
} from "./types";

const KEY = "hc_data";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function readData(): MockData {
  if (typeof window === "undefined") return DEFAULT_MOCK_DATA;
  return safeParse(localStorage.getItem(KEY), DEFAULT_MOCK_DATA);
}

export function writeData(data: MockData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function upsertUser(user: UserProfile): void {
  const data = readData();
  data.user = user;
  writeData(data);
}

export function getUser(): UserProfile | undefined {
  return readData().user;
}

export function getWallet(): Wallet {
  return readData().wallet;
}

export function setWallet(wallet: Wallet): void {
  const data = readData();
  data.wallet = wallet;
  writeData(data);
}

export function addTransaction(tx: Transaction): void {
  const data = readData();
  data.transactions.unshift(tx);
  writeData(data);
}

export function listTransactions(): Transaction[] {
  return readData().transactions;
}

export function addContribution(contribution: Contribution): void {
  const data = readData();
  data.contributions.unshift(contribution);
  writeData(data);
}

export function listContributions(): Contribution[] {
  return readData().contributions;
}

export function totalContributed(): number {
  return listContributions().reduce((sum, c) => sum + c.amountNaira, 0);
}

export function addGoal(goal: Goal): void {
  const data = readData();
  data.goals.unshift(goal);
  writeData(data);
}

export function listGoals(): Goal[] {
  return readData().goals;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random()
    .toString(36)
    .slice(2)}_${dayjs().valueOf()}`;
}

// Session helpers (dummy Clerk-like flow)
const SESSION_KEY = "hc_session_email";

export function setSessionEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, email);
}

export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
