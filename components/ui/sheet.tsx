"use client";

import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;

export function SheetContent({
  className,
  children,
  side = "left",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: "left" | "right" | "top" | "bottom";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
      <DialogPrimitive.Content
        {...props}
        className={cn(
          "fixed z-50 gap-4 bg-card p-6 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "left" &&
            "inset-y-0 left-0 w-80 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
          side === "right" &&
            "inset-y-0 right-0 w-80 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
          side === "top" &&
            "inset-x-0 top-0 h-1/3 data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-1/3 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          className
        )}>
        <button
          aria-label='Close'
          className='absolute right-4 top-4 rounded-md p-1 hover:bg-muted'
          as-child>
          <DialogPrimitive.Close>
            <X className='h-5 w-5' />
          </DialogPrimitive.Close>
        </button>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

