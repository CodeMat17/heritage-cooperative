"use client";

import { getUser } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VerifyPendingPage() {
  const router = useRouter();
  const user = getUser();
  const isVerified = user?.status === "verified";

  useEffect(() => {
    const id = setInterval(() => {
      const latest = getUser();
      if (latest?.status === "verified") {
        clearInterval(id);
        if (!latest.categoryId) router.replace("/categories");
        else router.replace("/account");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [router]);

  useEffect(() => {
    if (isVerified) {
      if (!user?.categoryId) router.replace("/categories");
      else router.replace("/account");
    }
  }, [isVerified, router, user?.categoryId]);

  return (
    <div className='grid gap-2'>
      <h1 className='text-2xl font-semibold tracking-tight'>Verification</h1>
      {!isVerified ? (
        <p className='text-muted-foreground'>
          Thanks for signing up! Your account is pending admin approval. You can
          explore categories while you wait.
        </p>
      ) : (
        <p className='text-muted-foreground'>
          You have been verified. Redirecting…
        </p>
      )}
    </div>
  );
}
