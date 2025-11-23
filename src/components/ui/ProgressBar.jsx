"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function ProgressBar({ progress, className, showLabel = true }) {
  // Ensure progress is between 0 and 100
  const validProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Course Progress
          </span>
          <span className="text-xs font-bold text-emerald-600">
            {validProgress}%
          </span>
        </div>
      )}
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${validProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"
        />
      </div>
    </div>
  );
}
