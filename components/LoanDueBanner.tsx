"use client";

import { findCategoryById, isLoanEligible, remainingDays } from "@/lib/mock";
import { getUser } from "@/lib/storage";

export default function LoanDueBanner() {
  const user = getUser();
  const category = findCategoryById(user?.categoryId);
  const eligible = isLoanEligible(
    user?.joinDateIso,
    category?.durationDays ?? 90
  );
  const daysLeft = remainingDays(
    user?.joinDateIso,
    category?.durationDays ?? 90
  );

  if (!category) return null;

  if (!eligible) {
    return (
      <div className='rounded-xl border p-4 bg-secondary/30 text-secondary-foreground'>
        <div className='text-sm'>
          Loan due in {daysLeft} days for your {category.name} plan.
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border p-4 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100'>
      <div className='text-sm font-medium'>
        Congratulations! You're now eligible to request a loan for your{" "}
        {category.name} plan.
      </div>
    </div>
  );
}
