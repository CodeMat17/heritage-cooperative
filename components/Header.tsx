"use client";

import { UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "./ui/button";

const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className='sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm'>
      <div className='w-full flex items-center justify-between max-w-7xl mx-auto px-4 py-3'>
        <div className=' text-sm sm:text-base font-medium'>Heritage Coop</div>
        <div className='flex items-center gap-1 sm:gap-2'>
          <button
            aria-label='Toggle theme'
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className='inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md border hover:bg-muted'>
            {theme === "dark" ? (
              <Sun className='h-4 w-4' />
            ) : (
              <Moon className='h-4 w-4' />
            )}
          </button>
          <Authenticated>
            <UserButton />
            {/* <Button asChild size='sm' className='hidden sm:inline-flex'>
              <Link href='/dashboard'>Dashboard</Link>
            </Button> */}
          </Authenticated>
          {/* <Unauthenticated>
            <Button asChild size='sm' className='hidden sm:inline-flex'>
              <Link href='/sign-in'>Sign in</Link>
            </Button>
            <Button asChild size='sm' className='hidden sm:inline-flex'>
              <Link href='/sign-up'>Sign up</Link>
            </Button>
          </Unauthenticated> */}
        </div>
      </div>
    </div>
  );
};

export default Header;
