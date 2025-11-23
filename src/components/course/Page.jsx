// app/courses/page.jsx
"use client"; // REQUIRED for using useState

import { useState } from "react";
import CourseFilter from "@/components/CourseFilter";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/Button";
import { Filter, Frown } from "lucide-react";
import { cn } from "@/lib/utils";

// --- MOCK DATA --- (Replace this with your actual API fetch later)
const MOCK_COURSES = [
  {
    _id: "c1",
    title: "HSC Physics Complete",
    thumbnail: "/img/physics.jpg",
    classType: "HSC",
    studentsEnrolled: 4500,
    price: 5000,
    discountedPrice: 4500,
    examsNumber: 15,
    instructors: [{ name: "Rahat" }],
    overview: "Full syllabus preparation for HSC Physics 1st and 2nd paper.",
  },
  {
    _id: "c2",
    title: "SSC Math Masterclass",
    thumbnail: "/img/math.jpg",
    classType: "SSC",
    studentsEnrolled: 2100,
    price: 3000,
    discountedPrice: 2800,
    examsNumber: 10,
    instructors: [{ name: "Tanjim" }],
    overview: "Master all chapters of General and Higher Math for SSC.",
  },
  {
    _id: "c3",
    title: "HSC Chemistry Master",
    thumbnail: "/img/chem.jpg",
    classType: "HSC",
    studentsEnrolled: 800,
    price: 6000,
    discountedPrice: null,
    examsNumber: 20,
    instructors: [{ name: "Sumi" }],
    overview: "Organic, Inorganic, and Physical Chemistry preparation.",
  },
  {
    _id: "c4",
    title: "SSC Biology Fundamentals",
    thumbnail: "/img/bio.jpg",
    classType: "SSC",
    studentsEnrolled: 1200,
    price: 2500,
    discountedPrice: 1999,
    examsNumber: 8,
    instructors: [{ name: "Raju" }],
    overview: "Core concepts of Biology and practical lab guidance.",
  },
];
// --- END MOCK DATA ---

export default function CoursesPage() {
  const allCourses = MOCK_COURSES;
  const [filteredCourses, setFilteredCourses] = useState(allCourses);
  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterChange = (filtered, filters) => {
    setFilteredCourses(filtered);
    setActiveFilters(filters);
  };

  // Logic to show a more descriptive heading for filtered results
  const getFilterDescription = () => {
    if (activeFilters.classType) {
      return `Showing all ${activeFilters.classType} courses.`;
    }
    if (activeFilters.search) {
      return `Showing results for "${activeFilters.search}".`;
    }
    return "Explore all available courses.";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Dynamic and Premium Header */}
        <header className="mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2">
            Course Catalog
          </h1>
          <p className="text-2xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            {getFilterDescription()}
          </p>
        </header>

        {/* Filter Component */}
        <CourseFilter
          courses={allCourses} // Pass the master list to the filter component
          onFilterChange={handleFilterChange}
        />

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">
          {filteredCourses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>

        {/* No Results State (Visually Enhanced) */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200 mt-10">
            <Frown className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <p className="text-2xl font-bold text-gray-800">
              Oops! No courses found.
            </p>
            <p className="text-lg text-gray-600 mt-2">
              Try adjusting your filters or clear them to see all options.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-8"
              variant="outline"
            >
              <Filter className="h-5 w-5 mr-2" />
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
