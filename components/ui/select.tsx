
"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn("flex h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none", className)}
      {...props}
    >
      {props.children}
      <SelectPrimitive.Icon><ChevronDown className="h-4 w-4 opacity-50" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md", className)} {...props} />
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item className={cn("relative flex w-full cursor-default select-none items-center px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground", className)} {...props} />
  );
}
