// src/components/ui/Button.jsx
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  // Base classes: Added a subtle scale effect on click for better feedback
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        // 🔥 Primary CTA - The Hero Button (Most Important Actions)
        primary:
          "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/50 hover:opacity-95",

        // Secondary - Solid Color for less important but prominent actions
        secondary:
          "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:text-gray-800 shadow-sm",

        // Outline - Clean, main color border (Replaces old 'secondary')
        outline:
          "bg-white text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-50 hover:border-emerald-600 shadow-sm",

        // Destructive (Logout, Delete)
        destructive:
          "bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:shadow-xl",

        // Ghost / Minimal
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-emerald-600",

        // Link style
        link: "text-emerald-600 underline-offset-4 hover:underline hover:text-emerald-700",
      },
      size: {
        // Adjusted sizes for a modern, slightly chunkier feel
        sm: "h-9 px-4 text-sm rounded-lg",
        md: "h-11 px-7 text-base rounded-xl",
        lg: "h-14 px-10 text-lg rounded-2xl",
        icon: "h-11 w-11 rounded-xl", // Matches md height
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = forwardRef(
  (
    { className, variant, size, isLoading = false, children, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Loader is slightly repositioned to not interfere with content */}
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {/* Display children only if present, otherwise 'Processing...' */}
            {children ? (
              <span className="opacity-70">{children}</span>
            ) : (
              "Processing..."
            )}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
