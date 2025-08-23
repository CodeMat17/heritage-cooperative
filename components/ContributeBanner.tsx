"use client";

import { findCategoryById } from "@/lib/mock";
import { getUser, listContributions } from "@/lib/storage";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ContributeBanner() {
  const user = getUser();
  const category = findCategoryById(user?.categoryId);
  const contributions = listContributions();

  const contributedToday = useMemo(
    () =>
      contributions.some(
        (c) =>
          dayjs(c.contributedAtIso).isSame(dayjs(), "day") &&
          c.categoryId === user?.categoryId
      ),
    [contributions, user?.categoryId]
  );

  const todayKey = `hc_banner_dismissed_${dayjs().format("YYYY-MM-DD")}`;
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(localStorage.getItem(todayKey) === "1");
  }, [todayKey]);

  function onDismiss() {
    if (typeof window !== "undefined") {
      localStorage.setItem(todayKey, "1");
    }
    setDismissed(true);
  }

  if (!category || contributedToday || dismissed) return null;

  return (
    <div className='rounded-xl border p-4 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200 flex items-start justify-between gap-3'>
      <div className='text-sm'>
        <div className='font-medium'>Contribute today</div>
        <div className='text-xs opacity-90'>
          Stay consistent to unlock your loan eligibility faster. Head over to
          your account to contribute now.
        </div>
        <Link href='/account' className='text-xs underline mt-1 inline-block'>
          Go to Account
        </Link>
      </div>
      <button
        onClick={onDismiss}
        className='text-xs underline opacity-80 hover:opacity-100'>
        Dismiss
      </button>
    </div>
  );
}

