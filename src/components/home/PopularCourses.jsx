// src/components/home/PopularCourses.jsx
import CourseCard from "@/components/course/CourseCard";
import Link from "next/link";
import { Button } from "@/components/ui/Button"; // Assuming Button is available
import { Frown, TrendingUp, ArrowRight } from "lucide-react"; // Import necessary icons

export default function PopularCourses({ courses }) {
  // Normalize the data and limit to a focused number of courses (e.g., 4)
  const courseArray = Array.isArray(courses)
    ? courses
    : courses?.courses
    ? courses.courses
    : courses?.data
    ? courses.data
    : [];

  const displayCourses = courseArray.slice(0, 4);

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Premium Header */}
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-base sm:text-lg font-semibold text-emerald-600 mb-2 sm:mb-3 uppercase tracking-wider flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" /> BEST SELLERS
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-500">
              Our Most Popular Courses
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mt-2 sm:mt-4">
            Join thousands of satisfied students and accelerate your academic
            journey with our top-rated programs.
          </p>
        </div>

        {/* Grid Display */}
        {displayCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {displayCourses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          // Enhanced Empty State
          <div className="col-span-full text-center py-12 md:py-20 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner">
            <Frown className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4 md:mb-6" />
            <p className="text-2xl md:text-3xl font-bold text-gray-600">
              No Popular Courses Found
            </p>
            <p className="text-lg md:text-xl text-gray-500 mt-4 px-4">
              The course catalog is currently being updated. Please check back
              soon!
            </p>
          </div>
        )}

        {/* Call to action for more courses */}
        <div className="text-center mt-12 md:mt-16">
          <Link href="/courses">
            <Button
              variant="outline"
              className="text-base md:text-lg px-8 py-4 md:px-10 md:py-6 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 shadow-md w-full sm:w-auto"
            >
              View All Courses <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
