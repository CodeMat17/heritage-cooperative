"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { findCategoryById } from "@/lib/mock";
import { getUser } from "@/lib/storage";
import dayjs from "dayjs";
import { User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const user = getUser();
  const category = findCategoryById(user?.categoryId);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label='User menu'
          className='inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted'>
          <User className='h-5 w-5' />
        </button>
      </SheetTrigger>
      <SheetContent side='right' className='w-80'>
        <div className='mb-3 font-semibold tracking-tight'>Profile</div>
        {!user && (
          <div className='text-sm text-muted-foreground'>
            No user signed up.
          </div>
        )}
        {user && (
          <div className='grid gap-2 text-sm'>
            <div>
              <div className='text-xs text-muted-foreground'>Email</div>
              <div className='font-medium break-all'>{user.email}</div>
            </div>
            <div>
              <div className='text-xs text-muted-foreground'>Status</div>
              <div className='font-medium capitalize'>{user.status}</div>
            </div>
            <div>
              <div className='text-xs text-muted-foreground'>Category</div>
              <div className='font-medium'>
                {category?.name ?? "Not selected"}
              </div>
            </div>
            {user.joinDateIso && (
              <div>
                <div className='text-xs text-muted-foreground'>Joined</div>
                <div className='font-medium'>
                  {dayjs(user.joinDateIso).format("D MMM, YYYY")}
                </div>
              </div>
            )}
            <div className='pt-2'>
              <Link
                href='/categories'
                onClick={() => setOpen(false)}
                className='inline-flex h-9 items-center rounded-md bg-primary px-3 text-primary-foreground hover:opacity-90'>
                Upgrade category
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

