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
    <div className="bg-white max-w-2xl mx-auto rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 justify-center sm:justify-start">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Secure Checkout
          </h2>
        </div>
        <p className="text-emerald-50 text-sm sm:text-base opacity-90">
          Complete your enrollment for <span className="font-semibold text-white">{course.title}</span>
        </p>
      </div>

      <div className="p-5 sm:p-8 space-y-8">
        {/* Course Summary */}
        <div className="flex flex-col sm:flex-row gap-5 p-4 bg-gray-50 rounded-xl border border-gray-200/60">
          <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-sm relative group">
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {course.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={course.classType === "HSC" ? "secondary" : "subtle"}
                className="font-semibold text-xs px-2.5 py-0.5"
              >
                {course.classType} Batch
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-100">
                <Users className="h-3 w-3" />
                {course.studentsEnrolled?.toLocaleString() || 0} Enrolled
              </span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="p-5 bg-emerald-50/50 border-b border-emerald-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-600" />
              Order Summary
            </h3>
          </div>
          
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600">Base Price</span>
              <span className="text-gray-400 line-through font-medium">
                ৳{originalPrice.toLocaleString()}
              </span>
            </div>

            {course.discountedPrice && (
              <div className="flex justify-between items-center text-red-600 font-medium text-sm sm:text-base">
                <span>Sale Discount</span>
                <span>
                  -৳{(originalPrice - discountedPrice).toLocaleString()}
                </span>
              </div>
            )}

            {appliedCoupon && (
              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-sm sm:text-base">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
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

            <div className="pt-4 mt-2 border-t border-gray-100">
              <div className="flex justify-between items-end">
                <span className="text-gray-800 font-bold text-lg">Total Payable</span>
                <span className="text-3xl font-extrabold text-emerald-600 leading-none">
                  ৳{finalPrice.toLocaleString()}
                </span>
              </div>
              {savings > 0 && (
                <p className="text-right text-xs font-medium text-emerald-600 mt-1">
                  You are saving ৳{savings.toLocaleString()} today!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Enrollment Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 bg-blue-50 rounded-md">
                <Users className="h-5 w-5 text-blue-600" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">Your Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={enrollmentInfo.phone}
                onChange={(e) => {
                  setEnrollmentInfo({ ...enrollmentInfo, phone: e.target.value });
                  setEnrollmentErrors({ ...enrollmentErrors, phone: '' });
                }}
                placeholder="01XXXXXXXXX"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
                  enrollmentErrors.phone ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                )}
              />
              {enrollmentErrors.phone && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {enrollmentErrors.phone}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Session/Batch <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={enrollmentInfo.session}
                onChange={(e) => {
                  setEnrollmentInfo({ ...enrollmentInfo, session: e.target.value });
                  setEnrollmentErrors({ ...enrollmentErrors, session: '' });
                }}
                placeholder="e.g. 2024-25"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
                  enrollmentErrors.session ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                )}
              />
              {enrollmentErrors.session && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {enrollmentErrors.session}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Facebook Profile Link <span className="text-red-500">*</span></label>
              <input
                type="url"
                value={enrollmentInfo.facebookId}
                onChange={(e) => {
                  setEnrollmentInfo({ ...enrollmentInfo, facebookId: e.target.value });
                  setEnrollmentErrors({ ...enrollmentErrors, facebookId: '' });
                }}
                placeholder="https://facebook.com/your.profile"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
                  enrollmentErrors.facebookId ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                )}
              />
              {enrollmentErrors.facebookId && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {enrollmentErrors.facebookId}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">School/College Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={enrollmentInfo.schoolCollege}
                onChange={(e) => {
                  setEnrollmentInfo({ ...enrollmentInfo, schoolCollege: e.target.value });
                  setEnrollmentErrors({ ...enrollmentErrors, schoolCollege: '' });
                }}
                placeholder="Enter your institution name"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
                  enrollmentErrors.schoolCollege ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                )}
              />
              {enrollmentErrors.schoolCollege && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {enrollmentErrors.schoolCollege}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Have a coupon?</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <CouponInput
              type="text"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              disabled={appliedCoupon !== null}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none uppercase text-gray-800 shadow-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode || isApplyingCoupon || appliedCoupon}
              isLoading={isApplyingCoupon}
              variant={appliedCoupon ? "success" : "outline"}
              className={cn(
                "sm:w-auto w-full py-3",
                appliedCoupon ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              )}
            >
              {appliedCoupon ? "Applied" : "Apply Coupon"}
            </Button>
          </div>
          {couponMessage && (
            <div className={cn("text-sm flex items-center gap-2 p-3 rounded-lg animate-in fade-in slide-in-from-top-2", 
                couponMessage.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
            )}>
              {couponMessage.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0"/> : <AlertCircle className="h-4 w-4 flex-shrink-0"/>}
              {couponMessage.text}
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          {[
            { icon: Trophy, text: `${course.examsNumber || "12+"} Model Tests`, color: "text-amber-500" },
            { icon: FileText, text: "Lecture Notes & PDFs", color: "text-indigo-500" },
            { icon: Users, text: "Private Community", color: "text-emerald-500" },
            { icon: MessageCircle, text: "Lifetime Access", color: "text-teal-500" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <item.icon className={cn("h-5 w-5 flex-shrink-0", item.color)} />
              <span className="text-sm font-medium text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Payment Button */}
        <div className="pt-4 space-y-4">
          {paymentError && (
             <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{paymentError}</p>
             </div>
          )}

          <Button
            size="lg"
            className="w-full text-lg py-6 font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
            onClick={initiatePayment}
            isLoading={isProcessingPayment}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              "Processing Secure Payment..."
            ) : (
              <span className="flex items-center gap-2">
                Pay ৳{finalPrice.toLocaleString()} & Enroll Now
              </span>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Lock className="h-3 w-3" />
            <span>Secured by SSLCommerz • 256-bit Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseForm;
