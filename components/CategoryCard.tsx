"use client";

import { naira } from "@/lib/mock";
import type { MembershipCategory } from "@/lib/types";
import { motion } from "framer-motion";

type Props = {
  category: MembershipCategory;
  onSelect: (id: MembershipCategory["id"]) => void;
};

export default function CategoryCard({ category, onSelect }: Props) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(category.id)}
      className='text-left rounded-xl border p-4 bg-card/60 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='font-semibold'>{category.name}</h3>
          <p className='text-sm text-muted-foreground'>
            {category.durationDays} days
          </p>
        </div>
        <div className='text-right'>
          <div className='text-sm'>Daily</div>
          <div className='font-semibold'>
            {naira(category.dailyContributionNaira)}
          </div>
        </div>
      </div>
      <div className='mt-3 text-xs text-muted-foreground'>
        Loan: {naira(category.loanEntitlementNaira)}
      </div>
    </motion.button>
  );
}
