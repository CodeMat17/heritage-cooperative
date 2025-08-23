"use client";

import CategoryCard from "@/components/CategoryCard";
import { MEMBERSHIP_CATEGORIES } from "@/lib/mock";
import { getUser, upsertUser } from "@/lib/storage";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function CategoriesPage() {
  const router = useRouter();
  const user = getUser();

  function handleSelect(
    categoryId: (typeof MEMBERSHIP_CATEGORIES)[number]["id"]
  ) {
    const user = getUser();
    if (!user) {
      router.push("/");
      return;
    }
    // Block unverified from selecting; show read-only content
    if (user.status !== "verified") {
      router.push("/verify-pending");
      return;
    }
    // Enforce single category; allow selecting only if none or upgrading to higher tiers
    if (user.categoryId && user.categoryId === categoryId) {
      router.push(`/categories/${categoryId}`);
      return;
    }
    const currentIndex = MEMBERSHIP_CATEGORIES.findIndex(
      (c) => c.id === user.categoryId
    );
    const nextIndex = MEMBERSHIP_CATEGORIES.findIndex(
      (c) => c.id === categoryId
    );
    const isUpgrade = currentIndex < nextIndex;
    if (user.categoryId && !isUpgrade) {
      router.push(`/categories/${user.categoryId}`);
      return;
    }
    upsertUser({ ...user, categoryId, joinDateIso: dayjs().toISOString() });
    router.push(`/categories/${categoryId}`);
  }

  return (
    <div className='grid gap-6'>
      <div className='grid gap-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Choose your membership category
        </h1>
        <p className='text-muted-foreground'>
          Each tier offers a unique contribution rate and loan entitlement after
          a minimum 90-day period.{" "}
          {user?.status !== "verified" &&
            "(Read-only preview until verification)"}
        </p>
      </div>
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {MEMBERSHIP_CATEGORIES.map((c) => (
          <CategoryCard key={c.id} category={c} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
