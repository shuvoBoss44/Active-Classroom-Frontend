// components/course/PurchaseButton.jsx
"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Loader2,
  CheckCircle,
  AlertTriangle,
  
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import PurchaseForm from "./PurchaseForm";
import { useAuth } from "@/hooks/useAuth";

export default function PurchaseButton({ course, user, className }) {
  const { open } = useModal();
  
    const { login, logout } = useAuth();
  const [loading, setLoading] = useState(false); // Kept for potential future use or transition states

  const handlePurchaseClick = () => {
    if (!user) {
      login();
      return;
    }

    open({
      title: "Checkout", // Title is hidden by PurchaseForm's own header usually, but good fallback
      content: <PurchaseForm course={course} user={user} />,
      hideFooter: true, // PurchaseForm has its own buttons
      type: "default",
    });
  };

  const finalPrice = course.discountedPrice || course.price;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* --- Purchase Button --- */}
      <button
        onClick={handlePurchaseClick}
        disabled={loading}
        className={cn(
          "w-full py-4 rounded-xl text-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 focus:outline-none focus:ring-4",

          // Default (Ready to Buy) State
          !loading &&
            "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-400/50 hover:shadow-xl hover:scale-[1.01] focus:ring-emerald-500/50",

          // Loading State
          loading &&
            "bg-gray-400 text-gray-800 cursor-wait shadow-none scale-100",

          className
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin" />
            Processing...
          </>
        ) : (
          // Primary Call to Action
          <>
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xl">Enroll Now </span>
            <span className="text-2xl font-extrabold">
              — ৳{finalPrice.toLocaleString()}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
