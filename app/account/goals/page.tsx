"use client";

import { naira } from "@/lib/mock";
import { addGoal, generateId, listGoals } from "@/lib/storage";
import dayjs from "dayjs";
import { useState } from "react";

export default function GoalsPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const goals = listGoals();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = Math.max(0, Number(amount));
    if (!title || !value) return;
    addGoal({
      id: generateId("goal"),
      title,
      targetAmountNaira: value,
      createdAtIso: dayjs().toISOString(),
    });
    setTitle("");
    setAmount("");
  }

  return (
    <div className='grid gap-6'>
      <div className='grid gap-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>Savings Goals</h1>
        <p className='text-muted-foreground'>
          Set a savings goal to stay motivated and track your progress.
        </p>
      </div>
      <form
        onSubmit={submit}
        className='grid gap-3 max-w-md p-4 border rounded-xl'>
        <input
          className='h-10 px-3 rounded-md border bg-background'
          placeholder='Goal title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className='h-10 px-3 rounded-md border bg-background'
          placeholder='Target amount (₦)'
          type='number'
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          className='h-10 rounded-md bg-primary text-primary-foreground hover:opacity-90'
          type='submit'>
          Create Goal
        </button>
      </form>
      <div className='grid gap-2'>
        {goals.length === 0 && (
          <div className='text-sm text-muted-foreground'>No goals yet.</div>
        )}
        {goals.map((g) => (
          <div
            key={g.id}
            className='rounded-xl border p-4 bg-card flex items-center justify-between'>
            <div>
              <div className='font-medium'>{g.title}</div>
              <div className='text-sm text-muted-foreground'>
                Target: {naira(g.targetAmountNaira)}
              </div>
            </div>
            <div className='text-xs text-muted-foreground'>
              {dayjs(g.createdAtIso).format("D MMM, YYYY")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
