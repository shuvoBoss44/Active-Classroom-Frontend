// src/components/ui/Badge.jsx
import { cn } from "@/lib/utils";

export function Badge({ children, variant = "default", className }) {
  const variants = {
    // New default look: Soft background, strong text
    default: "bg-gray-100 text-gray-700 font-medium border border-gray-200",

    // Status/Success: Our main emerald theme
    success:
      "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/30",

    // Secondary/Info: Use for general course info
    secondary: "bg-blue-100 text-blue-700 font-semibold border border-blue-200",

    // Subtle: Ideal for large lists or tag clouds (less visual noise)
    subtle:
      "bg-emerald-50 text-emerald-600 font-medium border border-emerald-100",

    // Outline: Clean and minimal
    outline: "bg-white border border-gray-300 text-gray-700 font-medium",

    // Warning/Admin Roles
    danger: "bg-rose-100 text-rose-700 font-semibold border border-rose-200",
  };

  return (
    <span
      className={cn(
        // General Styling: Increased padding, smaller font, full pill shape
        "inline-flex items-center px-3.5 py-1 text-xs uppercase tracking-wider rounded-full transition-all duration-200 whitespace-nowrap",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
