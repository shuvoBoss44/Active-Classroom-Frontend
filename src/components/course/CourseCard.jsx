// src/components/course/CourseCard.jsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { Clock, Users, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressBar from "@/components/ui/ProgressBar";

export default function CourseCard({ course, progress }) {
  const {
    _id,
    title,
    thumbnail,
    price,
    discountedPrice,
    classType,
    duration,
    studentsEnrolled,
    instructors,
  } = course;

  const hasDiscount = discountedPrice > 0 && discountedPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  // Check if user owns this course (if progress is provided, it implies ownership)
  const isOwned = progress !== undefined && progress !== null;

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full">
      {/* Thumbnail Section */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <Image
          src={thumbnail || "/course-placeholder.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            {classType}
          </span>
          {hasDiscount && !isOwned && (
            <span className="px-3 py-1 rounded-full bg-rose-500 text-xs font-bold text-white shadow-sm animate-pulse">
              -{discountPercent}%
            </span>
          )}
          {isOwned && (
             <span className="px-3 py-1 rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Enrolled
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-3">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            {duration || "Flexible"}
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            {(studentsEnrolled || 0).toLocaleString()}
          </div>
        </div>

        {/* Title */}
        <Link href={`/courses/${_id}`} className="block mb-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>
        </Link>

        {/* Instructors */}
        {instructors && instructors.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <div className="flex -space-x-2">
              {instructors.slice(0, 3).map((inst, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden relative"
                  title={inst.name}
                >
                  <Image
                    src={inst.profileImage || "/default-avatar.png"}
                    alt={inst.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            {instructors.length > 3 && (
              <span className="text-xs text-gray-500 font-medium">
                +{instructors.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto">
          {isOwned ? (
            // Progress Bar for Enrolled Courses
            <div className="mt-4">
               <ProgressBar progress={progress?.percentage || 0} />
               <Link href={`/courses/${_id}/learn`}>
                <button className="w-full mt-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group/btn">
                    Go to Content
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
               </Link>
            </div>
          ) : (
            // Price & CTA for New Users
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                    Course Fee
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-600">
                    ৳{(hasDiscount ? discountedPrice : price).toLocaleString()}
                    </span>
                    {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through font-medium">
                        ৳{price.toLocaleString()}
                    </span>
                    )}
                </div>
                </div>
                
                <Link href={`/courses/${_id}`}>
                <button className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:scale-110 transition-all duration-300">
                    <ArrowRight className="w-5 h-5" />
                </button>
                </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
