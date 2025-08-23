"use client";

import { readData, writeData } from "@/lib/storage";

export default function AdminPage() {
  const data = readData();

  function verify(status: "verified" | "rejected") {
    if (!data.user) return;
    data.user.status = status;
    writeData(data);
  }

  function freeze() {
    if (!data.user) return;
    if (data.user.status !== "verified") return;
    data.user.isFrozen = !data.user.isFrozen;
    writeData(data);
  }

  function remove() {
    if (!data.user) return;
    data.user = undefined as unknown as typeof data.user;
    writeData({ ...data, user: undefined });
  }

  return (
    <div className='grid gap-6'>
      <div className='grid gap-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Admin Dashboard
        </h1>
        <p className='text-muted-foreground'>
          Manage users and verify new members (mock).
        </p>
      </div>
      <div className='rounded-xl border p-4 bg-card'>
        {!data.user && (
          <div className='text-sm text-muted-foreground'>No users yet.</div>
        )}
        {data.user && (
          <div className='flex items-center justify-between'>
            <div className='text-sm'>
              <div className='font-medium'>{data.user.email}</div>
              <div className='text-muted-foreground'>
                Status: {data.user.status}
              </div>
              {data.user.status === "verified" && (
                <div className='text-xs mt-1'>
                  Frozen: {data.user.isFrozen ? "Yes" : "No"}
                </div>
              )}
            </div>
            <div className='flex gap-2'>
              {data.user.status === "pending" && (
                <>
                  <button
                    onClick={() => verify("verified")}
                    className='h-9 px-3 rounded-md bg-primary text-primary-foreground'>
                    Verify
                  </button>
                  <button
                    onClick={() => verify("rejected")}
                    className='h-9 px-3 rounded-md border'>
                    Reject
                  </button>
                </>
              )}
              {data.user.status === "verified" && (
                <>
                  <button
                    onClick={freeze}
                    className='h-9 px-3 rounded-md border'>
                    {data.user.isFrozen ? "Unfreeze" : "Freeze"}
                  </button>
                  <button
                    onClick={remove}
                    className='h-9 px-3 rounded-md bg-destructive text-white'>
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
