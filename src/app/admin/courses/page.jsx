// app/admin/courses/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

// Helper Component for a single Table Row
const CourseRow = ({ course, router, onDelete, pendingCount = 0, isAdmin }) => {
  const isDiscounted =
    course.discountedPrice && course.discountedPrice < course.price;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Course Title & Thumbnail */}
      <td className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0 relative h-12 w-16 rounded-md overflow-hidden border border-gray-100">
          <Image
            src={course.thumbnail || "/default-course.jpg"}
            alt={course.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{course._id}</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                {pendingCount}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Class Type (Pill Badge) */}
      <td className="p-4">
        <span
          className={cn(
            "px-3 py-1 text-xs font-semibold rounded-full",
            course.classType === "HSC"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          )}
        >
          {course.classType}
        </span>
      </td>

      {/* Enrollment */}
      <td className="p-4 text-center text-sm text-gray-700">
        {course.studentsEnrolled?.toLocaleString() || 0}
      </td>

      {/* Exams */}
      <td className="p-4 text-center text-sm text-gray-700">
        {course.examsNumber || 0}
      </td>

      {/* Price */}
      <td className="p-4 text-left">
        {isDiscounted ? (
          <div className="space-y-0.5">
            <p className="text-xs text-red-600 font-bold">
              ৳{course.discountedPrice.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 line-through">
              ৳{course.price.toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-sm font-semibold text-gray-900">
            ৳{course.price.toLocaleString()}
          </p>
        )}
      </td>

      {/* Actions */}
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <Button
            size="icon"
            variant="outline"
            title="Edit Course"
            onClick={e => {
              e.stopPropagation();
              router.push(`/admin/courses/edit/${course._id}`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button
              size="icon"
              variant="destructive"
              title="Delete Course"
              onClick={e => {
                e.stopPropagation();
                onDelete(course._id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default function ManageCourses() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("All"); // 'All', 'SSC', 'HSC'
  const [pendingCounts, setPendingCounts] = useState({}); // Map of courseId -> pending count

  // Define allowed roles
  const allowedRoles = ["admin", "moderator", "teacher"];
  const isAllowed = user && allowedRoles.includes(user.role);
  const isAdmin = user?.role === "admin";

  // Protect Route
  useEffect(() => {
    if (!authLoading && !isAllowed) {
      router.replace("/");
    }
  }, [user, authLoading, router, isAllowed]);

  // Fetch Courses
  useEffect(() => {
    if (isAllowed) {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/courses`,
            {
              credentials: "include",
            }
          );
          const data = await res.json();
          let fetchedCourses = [];
          if (data.data?.courses) {
            fetchedCourses = data.data.courses;
          } else if (Array.isArray(data.courses)) {
            fetchedCourses = data.courses;
          }
          setCourses(fetchedCourses);
        } catch (err) {
          console.error("Failed to fetch courses:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    }
  }, [user, isAllowed]);

  // Fetch pending enrollments count for each course
  useEffect(() => {
    if (isAllowed && courses.length > 0) {
      const fetchPendingCounts = async () => {
        try {
          // Fetch pending counts for all courses in parallel
          const countPromises = courses.map(async (course) => {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/course/${course._id}/pending-count`,
              { credentials: "include" }
            );
            const data = await res.json();
            return {
              courseId: course._id,
              count: data.success ? data.data.count : 0
            };
          });
          
          const results = await Promise.all(countPromises);
          const countsMap = {};
          results.forEach(({ courseId, count }) => {
            countsMap[courseId] = count;
          });
          setPendingCounts(countsMap);
        } catch (error) {
          console.error("Failed to fetch pending counts:", error);
        }
      };
      
      fetchPendingCounts();
      
      // Refresh every 10 seconds
      const interval = setInterval(fetchPendingCounts, 10000);
      return () => clearInterval(interval);
    }
  }, [user, courses, isAllowed]);

  // Delete Course
  const deleteCourse = async id => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This action is irreversible."
      )
    )
      return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        setCourses(courses.filter(c => c._id !== id));
      } else {
        alert("Failed to delete course. Please check server logs.");
      }
    } catch (err) {
      alert("A network error occurred while attempting to delete the course.");
    }
  };

  // Filter and Search Logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterClass === "All" || course.classType === filterClass;
    return matchesSearch && matchesFilter;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Loading Course Inventory...
          </p>
        </div>
      </div>
    );
  }

  if (!isAllowed) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Course Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Total Live Courses:{" "}
                <span className="font-semibold text-gray-700">
                  {courses.length}
                </span>
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => router.push("/admin/courses/create")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Course
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Filter Dropdown/Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            {["All", "SSC", "HSC"].map(type => (
              <button
                key={type}
                onClick={() => setFilterClass(type)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  filterClass === type
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Course List (Table) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">
                No Courses Found
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Try clearing the search or changing the filter.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterClass("All");
                }}
                className="mt-4 text-emerald-600"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3"
                  >
                    Course Title
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Level
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Students
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Exams
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredCourses.map(course => (
                  <CourseRow
                    key={course._id}
                    course={course}
                    router={router}
                    onDelete={deleteCourse}
                    pendingCount={pendingCounts[course._id] || 0}
                    isAdmin={isAdmin}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
