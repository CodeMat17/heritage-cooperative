"use client";

import SquadPayButton from "@/app/dashboard/SquadPayButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function WalletCard() {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMonth, setPaymentMonth] = useState<string>("");
  const [resolvedKey, setResolvedKey] = useState<string>("");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const response = await fetch("/api/config/squad-public-key");
        const data = await response.json();
        setResolvedKey(
          typeof data.publicKey === "string" ? data.publicKey : ""
        );
      } catch (error) {
        console.error("Failed to fetch Squad public key", error);
        setResolvedKey("");
      }
    };
    fetchPublicKey();
  }, []);

  const handleSuccess = () => {
    toast.success("Payment successful!");
  };

  return (
    <div className='rounded-xl border p-4 bg-card w-full bg-gradient-to-br from-primary/10 to-primary/5'>
      <h1
        className='text-xl font-medium text-blue-500
      '>
        Wallet
      </h1>
      {/* <p className='text-sm text-muted-foreground'>Current Balance</p> */}
      {/* <div className='text-2xl font-semibold'>Amount...</div> */}
      <div className='mt-3 space-y-2'>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email address'
          className='h-10 w-full rounded-md border px-3 bg-background'
        />
        <input
          type='number'
          min={500}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder='Amount (₦)'
          className='h-10 w-full rounded-md border px-3 bg-background'
        />

        <Select value={paymentMonth} onValueChange={setPaymentMonth}>
          <SelectTrigger className='h-10 w-full bg-background'>
            <SelectValue placeholder='Select payment month' />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <SquadPayButton
          email={email}
          amount={Math.max(0, Number(amount) || 0)}
          publicKey={resolvedKey ?? ""}
          paymentMonth={paymentMonth}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
