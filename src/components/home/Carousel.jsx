"use client";
import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";

export default function PremiumCarousel({ courses }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  if (!courses || courses.length === 0) return null;

  // --- Auto-advance Logic ---
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % courses.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, courses.length]);

  const next = () => setCurrent(prev => (prev + 1) % courses.length);
  const prev = () =>
    setCurrent(prev => (prev - 1 + courses.length) % courses.length);

  const course = courses[current];
  const price = course.price || 0;
  const discountedPrice = course.discountedPrice || 0;
  const hasDiscount = discountedPrice > 0 && discountedPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  return (
    <div
      className="relative min-h-[85vh] lg:min-h-[90vh] bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden flex items-center py-20 lg:py-0 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-3/4 h-full bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
         <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-200/30 blur-3xl animate-pulse" />
         <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-teal-200/30 blur-3xl" />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 hover:bg-white border border-gray-200 shadow-lg hover:shadow-xl flex items-center justify-center text-gray-700 transition-all hover:scale-110 backdrop-blur-sm"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 hover:bg-white border border-gray-200 shadow-lg hover:shadow-xl flex items-center justify-center text-gray-700 transition-all hover:scale-110 backdrop-blur-sm"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-12 lg:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8 order-2 lg:order-1 pb-16 lg:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={course._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-4 h-4" />
                    {course.classType}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-200 shadow-sm">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    {course.duration || "Flexible Schedule"}
                  </span>
                  {hasDiscount && (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-tight text-gray-900 tracking-tight">
                  {course.title}
                </h1>

                {/* Description */}
                <p className="text-lg text-gray-600 leading-relaxed max-w-xl line-clamp-3 font-medium">
                  {course.overview}
                </p>

                {/* Stats & Price */}
                <div className="flex flex-wrap items-center gap-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-md">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {(course.studentsEnrolled || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                        Students Enrolled
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-14 bg-gray-200" />

                  <div>
                    <div className="flex items-baseline gap-3">
                      {hasDiscount && (
                        <span className="text-lg text-gray-400 line-through font-semibold">
                          ৳{price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-4xl font-black text-emerald-600">
                        ৳{(hasDiscount ? discountedPrice : price).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                      Course Fee
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link 
                    href={`/courses/${course._id}`}
                    className="group relative px-8 py-4 rounded-2xl font-bold text-white bg-emerald-600 shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all duration-300 hover:scale-105 flex items-center gap-3"
                  >
                      <span>Enroll Now</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href={`/courses/${course._id}`}
                    className="px-8 py-4 rounded-2xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center gap-3 shadow-sm hover:shadow-md"
                  >
                        View Details
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Image Card */}
          <div className="relative order-1 lg:order-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={course._id}
                    initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.95, rotate: -2 }}
                    transition={{ duration: 0.5 }}
                    className="relative group"
                >
                    {/* Decorative Blob behind image */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-60 -z-10" />

                    <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border-4 border-white bg-white shadow-2xl shadow-emerald-900/10">
                    <Image
                        src={course.thumbnail || "/course-placeholder.jpg"}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <Play className="w-8 h-8 text-emerald-600 ml-1" fill="currentColor" />
                        </div>
                    </div>
                    </div>

                </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Simple Dots at Bottom Center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
             {courses.map((_, i) => (
                <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                    "h-2 rounded-full transition-all duration-300 shadow-sm",
                    i === current 
                        ? "w-10 bg-emerald-600" 
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                )}
                />
            ))}
        </div>
      </div>
    </div>
  );
}