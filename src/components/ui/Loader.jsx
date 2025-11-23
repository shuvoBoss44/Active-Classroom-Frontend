// src/components/ui/Loader.jsx
"use client";

import { cn } from "@/lib/utils";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

const Loader = ({
  size = "md",
  variant = "spinner", // spinner | dots | pulse | bar
  text,
  fullScreen = false,
  className,
}) => {
  const sizes = {
    sm: "w-6 h-6 border-3", // Added border-3 for spinner
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-5",
  };

  // Helper for dot sizes
  const dotSize =
    size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4";

  const spinner = (
    <div
      className={cn(
        // Dynamic border colors for a more premium spin effect
        "animate-spin rounded-full border-[5px] border-gray-200 border-t-emerald-500 border-b-teal-600",
        sizes[size],
        className
      )}
    />
  );

  const dots = (
    <div className="flex gap-2">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={cn(
            `${dotSize} bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full animate-bounce`
            // Custom Tailwind classes for animation delay are still respected
          )}
          // Explicit style for universal compatibility
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );

  const pulse = (
    <div className="relative flex items-center justify-center">
      {/* Outer pulsing ring */}
      <div
        className={cn(
          "rounded-full absolute bg-emerald-500/30 animate-ping opacity-75",
          size === "sm" ? "w-6 h-6" : size === "md" ? "w-10 h-10" : "w-16 h-16"
        )}
      />
      {/* Solid inner core (uses the AcademicCapIcon for branding) */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/40",
          size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-10 h-10",
          "z-10"
        )}
      >
        <AcademicCapIcon
          className={cn(
            size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-5 w-5",
            "text-white"
          )}
        />
      </div>
    </div>
  );

  const bar = (
    <div className="w-64 h-2.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 animate-pulse rounded-full w-2/3"
        // We use a fixed 2/3 width to simulate an indeterminate loading bar
      />
    </div>
  );

  const loaders = {
    spinner,
    dots,
    pulse,
    bar,
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-6 py-4">
      {loaders[variant]}
      {text && (
        <p className="text-gray-500 font-medium text-base animate-pulse tracking-wide">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        // Stronger glassmorphism effect
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md"
      >
        <div
          // Card look for the loader box
          className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12 border border-emerald-100/70"
        >
          {/* Logo animation above the content */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce duration-1000">
              <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export { Loader };
