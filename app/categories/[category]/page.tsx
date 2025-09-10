"use client";

import { MEMBERSHIP_CATEGORIES, naira } from "@/lib/mock";
import { getUser, upsertUser } from "@/lib/storage";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";

export default function CategoryDetailPage() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const category = MEMBERSHIP_CATEGORIES.find((c) => c.id === params.category);

  if (!category) {
    return <div>Category not found.</div>;
  }

  function handleSelect() {
    if (!category) return;
    const user = getUser();
    if (!user) return router.push("/");
    // Enforce single category; allow upgrade only
    if (user.categoryId === category.id) return router.push("/account");
    const currentIndex = MEMBERSHIP_CATEGORIES.findIndex(
      (c) => c.id === user.categoryId
    );
    const nextIndex = MEMBERSHIP_CATEGORIES.findIndex(
      (c) => c.id === category.id
    );
    const isUpgrade = currentIndex < nextIndex;
    if (user.categoryId && !isUpgrade) return router.push("/account");
    upsertUser({
      ...user,
      categoryId: category.id,
      joinDateIso: dayjs().toISOString(),
    });
    router.push("/account");
  }

  return (
    <div className='grid gap-4 py-20'>
      <h1 className='text-2xl font-semibold tracking-tight'>{category.name}</h1>
      <div className='rounded-xl border p-4 bg-card grid gap-2'>
        <div>
          Daily Contribution:{" "}
          <span className='font-medium'>
            {naira(category.dailyContributionNaira)}
          </span>
        </div>
        <div>
          Duration:{" "}
          <span className='font-medium'>{category.durationDays} days</span>
        </div>
        <div>
          Loan Entitlement:{" "}
          <span className='font-medium'>
            {naira(category.loanEntitlementNaira)}
          </span>
        </div>
        <button
          onClick={handleSelect}
          className='mt-2 h-10 rounded-md bg-primary text-primary-foreground px-4 w-fit'>
          Select Category
        </button>
      </div>
    </div>
  );
}
