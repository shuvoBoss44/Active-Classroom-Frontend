"use client";

import { useState, useEffect } from "react";
import { CheckCircle, ExternalLink, PlayCircle, BookOpen, Home, Loader2, Facebook } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tranId");
  const courseId = searchParams.get("courseId");
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    } else {
      setLoading(false);
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCourse(data.data.course);
      }
    } catch (err) {
      console.error("Failed to fetch course details", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border-t-4 border-emerald-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Congratulations! You are now enrolled in <span className="font-bold text-emerald-600">{course?.title || "the course"}</span>.
          </p>

          {tranId && (
            <div className="inline-block bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Transaction ID</p>
              <p className="text-sm font-mono text-gray-900 font-bold mt-1">{tranId}</p>
            </div>
          )}
        </div>

        {/* Facebook Group Section */}
        {course?.facebookGroupLink && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Facebook className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Join Our Facebook Group</h2>
                <p className="text-gray-500 text-sm">Connect with fellow students and instructors</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Get instant support, share resources, and stay updated with course announcements in our exclusive Facebook community.
            </p>

            <a
              href={course.facebookGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
            >
              <Facebook className="w-5 h-5" />
              Join Facebook Group
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Facebook Group Video Tutorial */}
            {course.facebookGroupVideoLink && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-emerald-600" />
                  How to Join the Group (Video Tutorial)
                </h3>
                <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <iframe
                    src={course.facebookGroupVideoLink}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Course Videos Section */}
        {course?.videos && course.videos.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Course Videos</h2>
                <p className="text-gray-500 text-sm">{course.videos.length} videos available</p>
              </div>
            </div>

            <div className="space-y-3">
              {course.videos
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((video, index) => (
                  <a
                    key={index}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <PlayCircle className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                        {video.title}
                      </h3>
                      {video.duration && (
                        <p className="text-sm text-gray-500">{video.duration}</p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 flex-shrink-0" />
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 What's Next?</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Join the Facebook group to connect with your peers</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Start watching the course videos at your own pace</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Access your course anytime from "My Courses"</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/profile" className="flex-1">
              <Button className="w-full bg-white text-emerald-600 hover:bg-gray-100 py-6 text-lg font-bold rounded-xl shadow-lg">
                <BookOpen className="w-5 h-5 mr-2" />
                Go to My Courses
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-white text-emerald-600 hover:bg-gray-100 py-6 text-lg font-bold rounded-xl shadow-lg">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
