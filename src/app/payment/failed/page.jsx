// app/payment/failed/page.jsx
"use client";

import { Suspense } from "react";
import { AlertTriangle, RotateCw, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tranId");
  const reason =
    searchParams.get("reason") || "The payment could not be processed.";

  const isCancelled = reason.toLowerCase().includes("cancelled");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-10 md:p-16 w-full max-w-lg text-center border-t-8 border-red-500">
        <XCircle className="h-16 w-16 sm:h-20 sm:w-20 text-red-500 mx-auto mb-6 animate-shake" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Payment {isCancelled ? "Cancelled" : "Failed"}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {isCancelled
            ? "You cancelled the payment process. You can try again at any time."
            : "We encountered an issue processing your payment. Your enrollment was not completed."}
        </p>

        <div className="bg-red-50 p-4 rounded-lg mb-8">
          <p className="text-sm text-red-700 font-semibold flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Reason: {reason}
          </p>
          {tranId && (
            <p className="text-xs font-mono text-gray-500 mt-2">
              Transaction ID: {tranId}
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <Link href="/courses">
            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md">
              <RotateCw className="h-5 w-5" /> Try Another Course
            </button>
          </Link>
          <Link href="/contact">
            <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-200 transition">
              Contact Support
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
