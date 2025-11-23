// app/courses/page.jsx
"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/course/CourseCard";
import CourseHero from "@/components/course/CourseHero";
import { Loader2, Filter, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const CLASS_TYPES = ["all", "SSC", "HSC"];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load courses");

        const result = await res.json();

        let courseArray = [];
        if (Array.isArray(result)) courseArray = result;
        else if (result?.courses) courseArray = result.courses;
        else if (result?.data) {
          courseArray = Array.isArray(result.data)
            ? result.data
            : result.data.courses || [];
        }

        setCourses(courseArray);
        setFilteredCourses(courseArray);
      } catch (err) {
        setError("Unable to fetch course data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    let result = [...courses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.title?.toLowerCase().includes(q) ||
          c.overview?.toLowerCase().includes(q)
      );
    }

    if (selectedClass !== "all") {
      result = result.filter(c => c.classType === selectedClass);
    }

    setFilteredCourses(result);
  }, [searchQuery, selectedClass, courses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl border border-red-200 max-w-md w-full">
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Error Loading Courses
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 text-lg"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <CourseHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        courseCount={courses.length}
      />

      {/* FILTER BAR */}
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-bold text-gray-800">
              {filteredCourses.length} Results
            </span>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            {CLASS_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedClass(type)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                  type === selectedClass
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                {type === "all" ? "All Classes" : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COURSE GRID */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="popLayout">
          {filteredCourses.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredCourses.map(course => (
                <motion.div
                  layout
                  key={course._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 md:py-32"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
                <Filter className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                We couldn't find any courses matching your search. Try adjusting your filters or search terms.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedClass("all");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 px-8"
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
