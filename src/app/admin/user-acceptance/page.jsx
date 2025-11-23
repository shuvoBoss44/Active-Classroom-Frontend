"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Facebook, CheckCircle, XCircle, ExternalLink, Users, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function UserAcceptancePage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState(null);
  
  // 1. NEW STATE: Store pending counts for each course (key: courseId, value: count)
  const [pendingCounts, setPendingCounts] = useState({});

  useEffect(() => {
    if (!authLoading && user) {
      if (!["admin", "moderator", "teacher"].includes(user.role)) {
        window.location.href = "/";
      } else {
        fetchCourses();
      }
    }
  }, [user, authLoading]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const coursesList = data.data.courses;
        setCourses(coursesList);
        
        // 2. NEW: Fetch pending counts for ALL courses immediately
        fetchAllPendingCounts(coursesList);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setLoading(false);
    }
  };

  // 3. NEW FUNCTION: Fetch pending counts for all courses in parallel
  const fetchAllPendingCounts = async (coursesList) => {
    const counts = {};
    
    // Create an array of promises to fetch counts for each course
    const promises = coursesList.map(async (course) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/course/${course._id}/pending-count`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success) {
          counts[course._id] = data.data.count;
        }
      } catch (err) {
        console.error(`Failed to fetch count for ${course._id}`, err);
      }
    });

    // Wait for all requests to finish
    await Promise.all(promises);
    setPendingCounts(counts);
  };

  const fetchEnrollments = async (courseId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/course/${courseId}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setEnrollments(data.data.enrollments);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
    }
    setLoading(false);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchEnrollments(course._id);
  };

  const handleAcceptanceToggle = async (enrollmentId, currentStatus) => {
    setUpdating(enrollmentId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/${enrollmentId}/accept`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isAccepted: !currentStatus }),
        }
      );
      const data = await res.json();
      if (data.success) {
        // Update enrollments list
        setEnrollments((prev) =>
          prev.map((e) =>
            e._id === enrollmentId
              ? { 
                  ...e, 
                  isAcceptedToFacebookGroup: !currentStatus, 
                  acceptedBy: !currentStatus ? user : null, 
                  acceptedAt: !currentStatus ? new Date() : null 
                }
              : e
          )
        );

        // 4. NEW: Optimistically update the notification badge count
        if (selectedCourse) {
            setPendingCounts(prev => ({
                ...prev,
                [selectedCourse._id]: !currentStatus 
                    ? Math.max(0, (prev[selectedCourse._id] || 0) - 1) // If accepting, decrease count
                    : (prev[selectedCourse._id] || 0) + 1 // If revoking, increase count
            }));
        }
        
        setTimeout(() => {
          setUpdating(null);
        }, 300);
      } else {
        setUpdating(null);
      }
    } catch (error) {
      console.error("Failed to update acceptance:", error);
      setUpdating(null);
    }
  };

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.phone.includes(searchQuery) ||
      enrollment.schoolCollege.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">User Acceptance</h1>
              <p className="text-gray-500 mt-1">Manage student enrollments and Facebook group access</p>
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              // 5. NEW: Get count for this specific course
              const pendingCount = pendingCounts[course._id] || 0;
              
              return (
                <button
                  key={course._id}
                  onClick={() => handleCourseSelect(course)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all group ${
                    selectedCourse?._id === course._id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-400 hover:bg-gray-50"
                  }`}
                >
                  {/* 6. NEW: Notification Badge */}
                  {pendingCount > 0 && (
                    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1 animate-in zoom-in duration-300">
                      <Bell className="w-3 h-3 fill-current" />
                      {pendingCount}
                    </div>
                  )}

                  <h3 className="font-bold text-gray-900 mb-1 pr-4">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.classType}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Enrollments List (Only shows when a course is selected) */}
        {selectedCourse && (
          <div className="bg-white rounded-3xl shadow-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
                <p className="text-gray-500">
                  {filteredEnrollments.length} total enrollment{filteredEnrollments.length !== 1 ? "s" : ""}
                </p>
              </div>
              {selectedCourse.facebookGroupLink && (
                <a
                  href={selectedCourse.facebookGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
                >
                  <Facebook className="w-5 h-5" />
                  Open Group
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Enrollments Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Student</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Contact</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Education</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Facebook</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Status</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-500">
                        No enrollments found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{enrollment.user.name}</div>
                          <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-700">{enrollment.phone}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-700">{enrollment.schoolCollege}</div>
                          <div className="text-sm text-gray-500">Session: {enrollment.session}</div>
                        </td>
                        <td className="py-4 px-4">
                          {enrollment.facebookId ? (
                             <a
                             href={enrollment.facebookId.startsWith('http') ? enrollment.facebookId : `https://facebook.com/${enrollment.facebookId}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                           >
                             View Profile
                             <ExternalLink className="w-3 h-3" />
                           </a>
                          ) : (
                            <span className="text-gray-400 italic">Not provided</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {enrollment.isAcceptedToFacebookGroup ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                              <CheckCircle className="w-4 h-4" />
                              Accepted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                              <XCircle className="w-4 h-4" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Button
                            onClick={() => handleAcceptanceToggle(enrollment._id, enrollment.isAcceptedToFacebookGroup)}
                            disabled={updating === enrollment._id}
                            variant={enrollment.isAcceptedToFacebookGroup ? "outline" : "default"}
                            className={`min-w-[100px] transition-all duration-300 ${
                              enrollment.isAcceptedToFacebookGroup
                                ? "bg-white border-red-600 text-red-600 hover:bg-red-50"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg"
                            }`}
                          >
                            {updating === enrollment._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : enrollment.isAcceptedToFacebookGroup ? (
                              "Revoke"
                            ) : (
                              "Accept"
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}