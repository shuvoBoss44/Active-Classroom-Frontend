// src/components/ui/Accordion.jsx
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming this is your utility for merging classes

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    // MODERN CARD LOOK: Rounded corners, soft shadow, subtle border, and separation
    className={cn(
      "mb-4 overflow-hidden rounded-xl border border-gray-200 shadow-lg/50 transition-all duration-300 ease-in-out hover:shadow-md/50",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between p-6 text-left font-extrabold text-gray-800 transition-all duration-300",
          // Hover State: changes color and gets a slightly brighter background
          "hover:bg-gray-50/70 hover:text-emerald-700",
          // Open State (using Radix data attribute)
          "group data-[state=open]:bg-emerald-50 data-[state=open]:text-emerald-700",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-6 w-6 shrink-0 text-emerald-600 transition-transform duration-300",
            // Icon Rotation when open
            "group-data-[state=open]:rotate-180"
          )}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
      ref={ref}
      // Added max-h to assist with smooth content transitions
      className="overflow-hidden text-gray-700 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div
        className={cn(
          "px-6 pb-6 pt-0 text-base leading-relaxed text-gray-600 border-t border-emerald-100", // Divider for content
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
