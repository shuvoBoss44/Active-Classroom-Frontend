// src/components/PurchaseForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
// import { Loader } from "@/components/ui/Loader"; // Replaced with inline lucide
import { useModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils"; // Required for cleaner Tailwind classes
import {
  CheckCircle,
  Lock,
  Tag,
  DollarSign,
  BookOpen,
  BadgeCheck,
  ShoppingCart,
  Users,
  AlertCircle,
  Trophy,
  MessageCircle,
  FileText,
  Loader2,
} from "lucide-react";

// Helper component for the styled input (to be replaced by InputField.jsx next)
const CouponInput = ({ ...props }) => (
  <input
    {...props}
    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none uppercase text-gray-800 shadow-sm"
  />
);

const PurchaseForm = ({ course, user }) => {
  const router = useRouter();
  // Removed useModal hook
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Feedback States
  const [couponMessage, setCouponMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [paymentError, setPaymentError] = useState(null);

  // Enrollment Information State
  const [enrollmentInfo, setEnrollmentInfo] = useState({
    phone: '',
    facebookId: '',
    schoolCollege: '',
    session: ''
  });
  const [enrollmentErrors, setEnrollmentErrors] = useState({});

  const originalPrice = course.price;
  const discountedPrice = course.discountedPrice || originalPrice;
  const finalPrice = appliedCoupon
    ? Math.round(discountedPrice * (1 - appliedCoupon.discountPercentage / 100))
    : discountedPrice;

  const savings = originalPrice - finalPrice;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponMessage(null); // Clear previous messages

    try {
      const res = await fetch(`/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, courseId: course._id }),
      });

      const data = await res.json();

      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponMessage({
            type: 'success',
            text: `Coupon applied! You saved ${data.coupon.discountPercentage}%`
        });
      } else {
        setCouponMessage({
            type: 'error',
            text: data.message || "Invalid or expired coupon."
        });
      }
    } catch (err) {
      setCouponMessage({
          type: 'error',
          text: "Failed to validate coupon. Check your connection."
      });
    }
    setIsApplyingCoupon(false);
  };

  const validateEnrollmentInfo = () => {
    const errors = {};
    
    if (!enrollmentInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^01[0-9]{9}$/.test(enrollmentInfo.phone)) {
      errors.phone = 'Enter a valid BD phone (01XXXXXXXXX)';
    }

    if (!enrollmentInfo.facebookId.trim()) {
      errors.facebookId = 'Facebook profile link is required';
    } else if (!enrollmentInfo.facebookId.includes('facebook.com')) {
      errors.facebookId = 'Enter a valid Facebook profile link';
    }

    if (!enrollmentInfo.schoolCollege.trim()) {
      errors.schoolCollege = 'School/College name is required';
    }

    if (!enrollmentInfo.session.trim()) {
      errors.session = 'Session/Batch is required';
    }

    setEnrollmentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const initiatePayment = async () => {
    // Validate enrollment info first
    if (!validateEnrollmentInfo()) {
      setPaymentError('Please fill in all required information correctly');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/initiate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            courseId: course._id,
            amount: finalPrice,
            couponId: appliedCoupon?._id || null,
            // Include enrollment information
            phone: enrollmentInfo.phone,
            facebookId: enrollmentInfo.facebookId,
            schoolCollege: enrollmentInfo.schoolCollege,
            session: enrollmentInfo.session
          }),
        }
      );

      const data = await res.json();

      if (data?.data?.paymentUrl) {
        // Redirect to SSLCommerz
        window.location.href = data.data.paymentUrl;
      } else {
        setPaymentError(data.message || "Payment initiation failed.");
        setIsProcessingPayment(false);
      }
    } catch (err) {
      setPaymentError("Network error. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="bg-white max-w-2xl mx-auto">
      {/* Header - Improved gradient */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 -mx-6 -mt-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Lock className="h-6 w-6 text-white" />
          <h2 className="text-3xl font-extrabold text-white">
            Secure Checkout
          </h2>
        </div>
        <p className="text-emerald-50 text-sm">
          Complete your enrollment for {course.title}
        </p>
      </div>

      <div className="space-y-6 px-6 pb-6">
        {/* Course Summary - Improved layout */}
        <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 border-white shadow-lg">
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
              {course.title}
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant={course.classType === "HSC" ? "secondary" : "subtle"}
                className="font-semibold text-xs"
              >
                {course.classType} Batch
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {course.studentsEnrolled?.toLocaleString() || 0} Students
              </span>
            </div>
          </div>
        </div>

        {/* Price Breakdown - Improved design */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-600" />
            Order Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-emerald-200/50">
              <span className="text-gray-600">Base Price</span>
              <span className="text-gray-400 line-through font-medium">
                ৳{originalPrice.toLocaleString()}
              </span>
            </div>

            {course.discountedPrice && (
              <div className="flex justify-between items-center text-red-600 font-semibold pb-3 border-b border-emerald-200/50">
                <span>Sale Discount</span>
                <span>
                  -৳{(originalPrice - discountedPrice).toLocaleString()}
                </span>
              </div>
            )}

            {appliedCoupon && (
              <div className="flex justify-between items-center bg-emerald-100 -mx-6 px-6 py-3 border-y border-emerald-300">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  <span>Coupon ({appliedCoupon.code})</span>
                </div>
                <span className="text-emerald-700 font-bold">
                  -৳
                  {Math.round(
                    discountedPrice * (appliedCoupon.discountPercentage / 100)
                  ).toLocaleString()}
                </span>
              </div>
            )}

            {/* Final Price Highlight */}
            <div className="pt-4 bg-gradient-to-r from-emerald-600 to-teal-600 -mx-6 px-6 py-5 -mb-6 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-lg">Total Payable</span>
                <span className="text-white text-3xl font-extrabold">
                  ৳{finalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {savings > 0 && (
            <div className="mt-4 text-center">
              <p className="text-emerald-700 font-bold text-sm bg-white/80 rounded-full py-2 px-4 inline-block">
                🎉 You're saving ৳{savings.toLocaleString()}!
              </p>
            </div>
          )}
        </div>

        {/* Enrollment Information Section */}
        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Users className="h-5 h-5 text-blue-600" />
            Your Information
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Required for course enrollment and Facebook group access
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={enrollmentInfo.phone}
                onChange={(e) => {
                  setEnrollmentInfo({ ...enrollmentInfo, phone: e.target.value });
                  setEnrollmentErrors({ ...enrollmentErrors, phone: '' });
                }}
                placeholder="01XXXXXXXXX"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                  enrollmentErrors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                )}
              />
              {enrollmentErrors.phone && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {enrollmentErrors.phone}
                </p>
              )}
            </div>

            {/* Session/Batch */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session/Batch *
              </label>
              <input
                type="text"
                value={enrollmentInfo.session}
                onChange={(e) => {
                  setEnrollmentInfo({ ...enrollmentInfo, session: e.target.value });
                  setEnrollmentErrors({ ...enrollmentErrors, session: '' });
                }}
                placeholder="2024-2025"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                  enrollmentErrors.session ? "border-red-500 bg-red-50" : "border-gray-300"
                )}
              />
              {enrollmentErrors.session && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {enrollmentErrors.session}
                </p>
              )}
            </div>

            {/* Facebook Profile Link */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Facebook Profile Link *
              </label>
              <input
                type="url"
                value={enrollmentInfo.facebookId}
                onChange={(e) => {
                  setEnrollmentInfo({ ...enrollmentInfo, facebookId: e.target.value });
                  setEnrollmentErrors({ ...enrollmentErrors, facebookId: '' });
                }}
                placeholder="https://facebook.com/yourprofile"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                  enrollmentErrors.facebookId ? "border-red-500 bg-red-50" : "border-gray-300"
                )}
              />
              {enrollmentErrors.facebookId && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {enrollmentErrors.facebookId}
                </p>
              )}
            </div>

            {/* School/College */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                School/College Name *
              </label>
              <input
                type="text"
                value={enrollmentInfo.schoolCollege}
                onChange={(e) => {
                  setEnrollmentInfo({ ...enrollmentInfo, schoolCollege: e.target.value });
                  setEnrollmentErrors({ ...enrollmentErrors, schoolCollege: '' });
                }}
                placeholder="Your Institution Name"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                  enrollmentErrors.schoolCollege ? "border-red-500 bg-red-50" : "border-gray-300"
                )}
              />
              {enrollmentErrors.schoolCollege && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {enrollmentErrors.schoolCollege}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Coupon Section (Uses temporary CouponInput) */}
        <div className="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            Apply Your Coupon Code
          </h3>
          <div className="flex gap-3">
            <CouponInput
              type="text"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code (e.g. SUMMER20)"
              disabled={appliedCoupon !== null}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode || isApplyingCoupon || appliedCoupon}
              isLoading={isApplyingCoupon}
              variant={appliedCoupon ? "success" : "default"}
              className="px-6 min-w-[120px]"
            >
              {appliedCoupon ? "Applied!" : "Apply"}
            </Button>
          </div>
          {/* Coupon Feedback */}
          {couponMessage && (
            <div className={cn("mt-3 text-sm flex items-center gap-2 p-3 rounded-lg", 
                couponMessage.type === 'success' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            )}>
              {couponMessage.type === 'success' ? <CheckCircle className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
              {couponMessage.text}
            </div>
          )}
        </div>

        {/* What You Get */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">
            What's Included in Your Purchase:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: <Trophy className="h-6 w-6" />,
                text: `${course.examsNumber || "12+"} Model Tests + Solutions`,
                color: "text-amber-500",
              },
              {
                icon: <FileText className="h-6 w-6" />,
                text: "Chapter-wise Notes (PDF + Drive)",
                color: "text-indigo-500",
              },
              {
                icon: <Users className="h-6 w-6" />,
                text: "Exclusive Student Community Access",
                color: "text-emerald-500",
              },
              {
                icon: <MessageCircle className="h-6 w-6" />,
                text: "Lifetime Access & Free Updates",
                color: "text-teal-500",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className={cn("flex-shrink-0", item.color)}>
                  {item.icon}
                </div>
                <span className="font-semibold text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Secure Payment & CTA */}
        <div className="text-center pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <Lock className="h-5 w-5 text-emerald-600 animate-pulse" />
            <span className="font-semibold text-gray-700">
              Secured Payment Gateway • 256-bit Encryption
            </span>
          </div>

          {/* Payment Error Feedback */}
          {paymentError && (
             <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 justify-center">
                <AlertCircle className="h-4 w-4" />
                {paymentError}
             </div>
          )}

          <Button
            size="lg"
            className="w-full text-xl py-6 font-bold shadow-lg shadow-emerald-500/20"
            onClick={initiatePayment}
            isLoading={isProcessingPayment}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay ৳{finalPrice.toLocaleString()} & Enroll</>
            )}
          </Button>

          <p className="text-xs text-gray-400 mt-4">
            By clicking "Pay & Enroll," you agree to our Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseForm;
