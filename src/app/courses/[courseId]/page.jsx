"use client";

import { useState, useEffect } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircle,
  Clock,
  FileText,
  Users,
  ChevronDown,
  BookOpen,
  X, // Added for the modal close button
  Loader2,
} from "lucide-react";
import PurchaseButton from "@/components/course/PurchaseButton";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// --- NEW COMPONENT: Video Modal ---
const VideoModal = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;

  // Function to convert YouTube URL formats to an embed URL
  const getEmbedUrl = url => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    // Fallback for other direct embed links (e.g., Vimeo, or if user put raw embed URL)
    if (url.includes("embed")) return url;

    // Default to the original URL if not recognizable, though embedding might fail
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose} // Close when clicking the overlay
    >
      <div
        className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the content
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close video player"
        >
          <X className="w-6 h-6" />
        </button>
        <iframe
          className="w-full h-full"
          src={embedUrl}
          title="Course Demo Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};
// --- END Video Modal ---

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // STATE: Control video modal visibility
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    if (!courseId || authLoading) return;

    const loadCourse = async () => {
      try {
        // --- MODIFICATION HERE: ADD QUERY PARAMETER FOR POPULATION ---
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}?populate=instructors`;

        const response = await fetch(apiUrl, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });
        // -----------------------------------------------------------------

        if (!response.ok) {
          if (response.status === 404) return setCourse(null);
          throw new Error("Failed to fetch course");
        }

        const data = await response.json();
        const courseData = data.data?.course || data.course;
        if (!courseData) {
          setCourse(null);
          return;
        }

        setCourse(courseData);

        // Check enrollment status
        let enrolled = false;
        if (user) {
          // Allow admin, moderator, and teacher to access without purchase
          if (["admin", "moderator", "teacher"].includes(user.role)) {
            enrolled = true;
          } else if (user.purchasedCourses) {
            // Check if the user's purchasedCourses array contains the course ID
            enrolled = user.purchasedCourses.some(
              c => c === courseId || c._id === courseId
            );
          }
        }
        
        setIsEnrolled(enrolled);

      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, user, authLoading]);

  const router = useRouter();
  
  // Redirect if enrolled
  useEffect(() => {
      if (!loading && isEnrolled && course) {
          router.replace(`/courses/${courseId}/learn`);
      }
  }, [loading, isEnrolled, course, router, courseId]);
  console.log(course)
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }
  if (!course) return notFound();

  const hasDiscount =
    course.discountedPrice && course.discountedPrice < course.price;
  const discountPercent = hasDiscount
    ? Math.round(((course.price - course.discountedPrice) / course.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Video Modal Render */}
      {isVideoModalOpen && course.demoVideo && (
        <VideoModal
          videoUrl={course.demoVideo}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}

      {/* --- 1. HEADER SECTION --- */}
      <div className="bg-gray-900 text-white pt-8 pb-12 lg:pt-16 lg:pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="lg:max-w-[65%] space-y-6">
            {/* Class Type Badge */}
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
              <span className="bg-emerald-900/50 border border-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider text-xs">
                {course.classType}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
              {course.title}
            </h1>

            {/* Overview (From Schema) */}
            {course.overview && (
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                {course.overview}
              </p>
            )}

            {/* Real Stats (From Schema) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-300 pt-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>
                  {course.studentsEnrolled?.toLocaleString() || 0} Enrolled
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>
                  Updated{" "}
                  {new Date(course.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-12 relative">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Course Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Course Stats / Summary */}
            <div className="flex flex-wrap gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Lectures
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {course.facebookGroupVideos.length || 0}
                  </p>
                </div>
              </div>
                  {/* no of instructors */}
                  <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Instructors
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {course.instructors.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Description (From Schema) */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <div className="prose prose-emerald max-w-none text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {course.description ||
                  course.overview ||
                  "No description available."}
              </div>
            </div>


            {/* Instructors (From Schema) */}
            {course.instructors && course.instructors.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Instructors
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {course.instructors.map(inst => (
                    <div
                      key={inst._id || inst.id}
                      className="flex gap-4 p-5 border border-gray-200 rounded-xl bg-white"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden relative border border-gray-100">
                          <Image
                            src={inst.profileImage || "/default-avatar.png"}
                            alt={inst.name || "Instructor"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {inst.name || "Instructor Name"}
                        </h3>
                        <p className="text-sm text-emerald-600 font-medium">
                          {inst.role || "Instructor"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ (From Schema) */}
            {course.faq && course.faq.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {course.faq.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenFaqIndex(openFaqIndex === index ? null : index)
                        }
                        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-800">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-gray-400 transition-transform",
                            openFaqIndex === index ? "rotate-180" : ""
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          "bg-gray-50 px-5 text-sm text-gray-600 transition-all overflow-hidden",
                          openFaqIndex === index
                            ? "max-h-96 py-4 border-t border-gray-200"
                            : "max-h-0"
                        )}
                      >
                        {item.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Sticky Sidebar (Pricing & Action) */}
          <div className="lg:col-span-1 relative">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white border border-gray-200 shadow-2xl shadow-gray-200/50 rounded-2xl overflow-hidden lg:-mt-96 z-20 relative">
                {/* Thumbnail & Demo Video: Added onClick handler */}
                <div
                  className={cn(
                    "relative aspect-video bg-gray-900 group",
                    course.demoVideo && !isEnrolled
                      ? "cursor-pointer"
                      : "cursor-default" // Only clickable if video exists and not enrolled
                  )}
                  onClick={() => {
                    if (course.demoVideo && !isEnrolled) {
                      setIsVideoModalOpen(true);
                    }
                  }}
                >
                  <Image
                    src={course.thumbnail || "/default-course-bg.jpg"}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                  {course.demoVideo && !isEnrolled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-12 h-12 text-white fill-current" />
                      </div>
                    </div>
                  )}
                  {course.demoVideo && !isEnrolled && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center">
                      <p className="text-white text-xs font-bold uppercase tracking-wider">
                        Watch Preview
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Pricing */}
                  {!isEnrolled ? (
                    <div className="flex items-baseline gap-3">
                      {hasDiscount ? (
                        <>
                          <span className="text-4xl font-extrabold text-gray-900">
                            ৳{course.discountedPrice.toLocaleString()}
                          </span>
                          <span className="text-lg text-gray-400 line-through decoration-2">
                            ৳{course.price.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded ml-auto">
                            {discountPercent}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-4xl font-extrabold text-gray-900">
                          ৳{course.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl font-bold text-center border border-emerald-100">
                      You own this course
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isEnrolled ? (
                    <div className="space-y-3">
                      <PurchaseButton
                        course={course}
                        user={user}
                        className="w-full py-4 text-lg shadow-lg shadow-emerald-200"
                      />
                    </div>
                  ) : (
                    <Link
                      href={`/courses/${course._id}/learn`}
                      // Styles applied directly to Link as discussed
                      className="w-full py-4 text-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-center transition-colors block"
                    >
                      Go to Content
                    </Link>
                  )}

                  {/* What's Inside (Only DB fields) */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-sm text-gray-900">
                      This course includes:
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-emerald-600" />
                        {course.facebookGroupVideos.length} Lectures
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}