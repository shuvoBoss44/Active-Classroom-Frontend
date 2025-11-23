// components/course/EnrolledContent.jsx
"use client"; // Retain: This component is responsible for interactivity (e.g., hover effects, Link components)
import Link from "next/link";
import {
  BookOpen,
  Video,
  FileText,
  Layers,
  GraduationCap,
  Facebook,
} from "lucide-react"; // <-- FIXED: Added 'from "lucide-react";'
// Removed 'notFound' and 'cn' imports as they weren't used or weren't strictly needed for this file's logic

// 1. ADDED `facebookGroupLink` PROP
export default function EnrolledContent({
  courseId,
  subjects,
  facebookGroupLink,
}) {
  // --- 1. Enhanced "Content Preparing" State ---
  if (!subjects || !subjects.length) {
    return (
      <div className="bg-amber-50 border-4 border-amber-300 rounded-3xl p-12 text-center shadow-xl mt-12">
        <GraduationCap className="h-16 w-16 text-amber-500 mx-auto mb-6 animate-pulse" />
        <p className="text-4xl font-extrabold text-amber-800">
          Course Content In Progress!
        </p>
        <p className="text-xl text-amber-700 mt-4">
          Our expert teachers are preparing the lectures and notes. Please check
          back soon!
        </p>
      </div>
    );
  }

  return (
    // --- Main Dashboard Container ---
    <div className="min-h-[600px] bg-white rounded-3xl shadow-2xl p-6 sm:p-12 mt-12 border border-gray-100">
      {/* 2. Hero Header - Separated from the content list */}
      <div className="text-center mb-10 p-6 sm:p-8 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-center gap-6">
          <BookOpen className="h-10 w-10 sm:h-12 sm:w-12" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            YOUR ENROLLED CONTENT
          </h2>
        </div>
        <p className="text-lg mt-3 opacity-90">
          Dive into the curriculum and start your learning journey!
        </p>
      </div>

      {/* 3. UPDATED: Facebook Group CTA Banner - Integrated Look */}
      {facebookGroupLink && (
        <div className="mb-16">
          <Link
            href={facebookGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            // Change 1: Updated background gradient and border color
            className="block w-full p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl shadow-xl transition duration-300 transform hover:scale-[1.01] border-2 border-blue-400 group"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-white">
              {/* Change 2: Removed animate-pulse, increased icon size slightly */}
              <Facebook className="h-12 w-12 sm:h-14 sm:w-14 text-white group-hover:rotate-6 transition duration-300" />
              <div className="text-center sm:text-left">
                {/* Change 3: Slightly rephrased headline for impact */}
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Join Our Private Student Mastermind!
                </p>
                <p className="text-base sm:text-xl mt-1 font-medium opacity-95">
                  Click to access the exclusive Facebook community for Q&A and
                  networking.
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* --- Subject List --- */}
      <div className="space-y-10">
        {subjects.map((subject, index) => (
          // Subject Card (Prominent and structured)
          <div
            key={subject._id}
            className="bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md transition-shadow duration-300 hover:shadow-xl"
          >
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-8 flex items-center gap-4 text-emerald-800">
              <span className="text-3xl font-mono text-emerald-500 w-8">
                {index + 1}.
              </span>
              <Layers className="h-8 w-8 text-emerald-500 flex-shrink-0" />
              {subject.name}
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subject.chapters?.map((chapter, chapterIndex) => (
                // Chapter Link Card (High contrast, clickable feel)
                <Link
                  key={chapter._id}
                  href={`/courses/${courseId}/chapter/${chapter._id}`}
                  className="block group bg-white rounded-2xl p-5 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-emerald-300 relative overflow-hidden"
                >
                  {/* Subtle hover effect: Left border swipe */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/0 group-hover:bg-emerald-500 transition-all duration-300 rounded-full" />

                  <p className="text-sm font-bold text-emerald-500 mb-2">
                    CHAPTER {chapterIndex + 1}
                  </p>
                  <h4 className="text-lg font-extrabold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {chapter.title}
                  </h4>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span className="font-semibold">
                        {chapter.lectures?.length || 0} Lectures
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="font-semibold">
                        {chapter.notes?.length || 0} Notes
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 5. REMOVED the old inspirational footer banner */}
    </div>
  );
}
