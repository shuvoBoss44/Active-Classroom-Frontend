"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Facebook, PlayCircle, BookOpen, ExternalLink, ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CourseContentPage({ params }) {
  const router = useRouter();
  const { courseId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      checkEnrollmentAndFetchCourse();
    }
  }, [user, authLoading, courseId]);

  const checkEnrollmentAndFetchCourse = async () => {
    try {
      // First, fetch the latest user data to ensure we have up-to-date purchasedCourses
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/getMe`, {
        credentials: "include",
      });

      if (!userRes.ok) {
        setError("Failed to verify enrollment");
        setLoading(false);
        return;
      }

      const userData = await userRes.json();
      const latestUser = userData.data?.user || userData.user;

      // Check if user is enrolled using the latest data
      let enrolled = false;
      if (latestUser) {
          if (["admin", "moderator", "teacher"].includes(latestUser.role)) {
              enrolled = true;
          } else if (latestUser.purchasedCourses) {
              enrolled = latestUser.purchasedCourses.some(
                  (c) => (c._id || c) === courseId
              );
          }
      }
      setIsEnrolled(enrolled);

      if (!enrolled) {
        setLoading(false);
        return;
      }

      // Fetch course details
      const courseRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, { credentials: "include" });

      const courseData = await courseRes.json();

      console.log('Course Data:', courseData);

      if (courseData.status === 'success') {
        setCourse(courseData.data.course);
      } else {
        setError("Failed to load course");
      }

    } catch (err) {
      console.error("Failed to fetch data", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };



  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You need to enroll in this course to access the content.
          </p>
          <Link href={`/courses/${courseId}`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              View Course Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Course not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-900 -ml-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Course
            </Button>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
              {course.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Enrolled
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - Main Content (Videos) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Course Lectures</h2>
              <p className="text-gray-500 mt-1">Watch your video lessons and access lecture notes.</p>
            </div>

            {/* Video List (Main Content) */}
            {course.facebookGroupVideos && course.facebookGroupVideos.length > 0 ? (
              <div className="space-y-4">
                {course.facebookGroupVideos.map((video, index) => (
                  <div 
                    key={index}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <PlayCircle className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-2">
                            {video.title}
                          </h3>
                          
                          <div className="flex flex-wrap gap-3">
                              <a 
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                <PlayCircle className="w-4 h-4" />
                                Watch Video
                              </a>
                              
                              {video.noteUrl ? (
                                  <a 
                                      href={video.noteUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                                  >
                                      <BookOpen className="w-4 h-4" />
                                      Lecture Sheet
                                  </a>
                              ) : (
                                  <button 
                                      disabled
                                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 cursor-not-allowed"
                                  >
                                      <BookOpen className="w-4 h-4" />
                                      Lecture Sheet
                                  </button>
                              )}
                          </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                // Empty State for Videos
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 md:p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No Lectures Yet</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                    The instructor hasn't published any video lectures yet. Please check back later.
                  </p>
                </div>
            )}
          </div>

          {/* RIGHT COLUMN - Sidebar (Syllabus & Community) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Community Card */}
            {course.facebookGroupLink && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white overflow-hidden relative">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">Private Community</h3>
                  </div>
                  <p className="text-blue-100 text-sm mb-5 leading-relaxed opacity-90">
                    Join our exclusive Facebook group for live Q&A sessions and peer support.
                  </p>
                  <a
                    href={course.facebookGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    Join Group <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            )}

            {/* Syllabus / Course Outline */}
            {course.subjects && course.subjects.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-500" />
                    Course Syllabus
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {course.subjects.map((subject, subjectIdx) => (
                    <div key={subject._id || subjectIdx} className="p-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">{subject.name}</h4>
                      <div className="space-y-1">
                        {subject.chapters?.map((chapter, chapterIdx) => (
                          <div key={chapter._id || chapterIdx} className="pl-3 border-l-2 border-gray-200 py-1">
                            <p className="text-xs font-medium text-gray-600">
                              {chapter.title}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {chapter.lectures?.length || 0} Lectures • {chapter.notes?.length || 0} Notes
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
