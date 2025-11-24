// src/components/CourseFilter.jsx
"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const CourseFilter = ({
  courses = [],
  onFilterChange,
  initialFilters = {},
  showSearch = true,
  showClassFilter = true,
  showPriceFilter = true,
  showSort = true,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
  const [selectedClass, setSelectedClass] = useState(
    initialFilters.classType || "all"
  );
  const [priceRange, setPriceRange] = useState(
    initialFilters.priceRange || "all"
  );
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "popular");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedClass, priceRange, sortBy]);

  const applyFilters = () => {
    const filters = {
      search: searchQuery.trim().toLowerCase(),
      classType: selectedClass === "all" ? null : selectedClass,
      priceRange,
      sortBy,
    };

    const filtered = courses.filter(course => {
      // Search in title
      const matchesSearch =
        !filters.search ||
        course.title.toLowerCase().includes(filters.search) ||
        (course.overview &&
          course.overview.toLowerCase().includes(filters.search));

      // Class filter
      const matchesClass =
        !filters.classType || course.classType === filters.classType;

      // Price filter
      let matchesPrice = true;
      const finalPrice = course.discountedPrice || course.price;

      if (filters.priceRange === "under5000") matchesPrice = finalPrice < 5000;
      else if (filters.priceRange === "5000-10000")
        matchesPrice = finalPrice >= 5000 && finalPrice <= 10000;
      else if (filters.priceRange === "over10000")
        matchesPrice = finalPrice > 10000;

      return matchesSearch && matchesClass && matchesPrice;
    });

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "popular") return b.studentsEnrolled - a.studentsEnrolled;
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "price-low")
        return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
      if (sortBy === "price-high")
        return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
      return 0;
    });

    onFilterChange(sorted, filters);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedClass("all");
    setPriceRange("all");
    setSortBy("popular");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedClass !== "all" ||
    priceRange !== "all" ||
    sortBy !== "popular";

  return (
    <div className="w-full space-y-6">
      {/* Main Filter Bar (Card Look) */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-wrap gap-4 sm:gap-8 items-end">
          {/* Search Box (Modernized Input) */}
          {showSearch && (
            <div className="flex-1 w-full sm:min-w-80">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Courses
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by course name or subject..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-gray-800 text-base shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Class Type Filter (Modern Toggle Buttons) */}
          {showClassFilter && (
            <div className="min-w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Level
              </label>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                <button
                  onClick={() => setSelectedClass("all")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                    selectedClass === "all"
                      ? "bg-white text-emerald-600 shadow-md ring-1 ring-gray-200"
                      : "text-gray-600 hover:bg-white/50"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedClass("SSC")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                    selectedClass === "SSC"
                      ? "bg-white text-emerald-600 shadow-md ring-1 ring-gray-200"
                      : "text-gray-600 hover:bg-white/50"
                  )}
                >
                  SSC
                </button>
                <button
                  onClick={() => setSelectedClass("HSC")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                    selectedClass === "HSC"
                      ? "bg-white text-emerald-600 shadow-md ring-1 ring-gray-200"
                      : "text-gray-600 hover:bg-white/50"
                  )}
                >
                  HSC
                </button>
              </div>
            </div>
          )}

          {/* Price Range Filter (Styled Select) */}
          {showPriceFilter && (
            <div className="min-w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-white font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none appearance-none cursor-pointer text-gray-700 shadow-sm"
              >
                <option value="all">All Prices</option>
                <option value="under5000">Under ৳5,000</option>
                <option value="5000-10000">৳5,000 - ৳10,000</option>
                <option value="over10000">Over ৳10,000</option>
              </select>
            </div>
          )}

          {/* Sort Dropdown (Styled Select) */}
          {showSort && (
            <div className="min-w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-white font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none appearance-none cursor-pointer text-gray-700 shadow-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          )}

          {/* Reset Button (Aligned with bottom of filters) */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="h-fit mt-auto py-3.5"
            >
              <X className="h-5 w-5 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters Summary (Enhanced Badges) */}
        {hasActiveFilters && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-600 mb-3">
              Active Filters:
            </p>
            <div className="flex flex-wrap gap-3">
              {searchQuery && (
                <Badge variant="subtle" className="text-gray-800 font-medium">
                  Search: "{searchQuery}"
                  <X
                    className="h-3.5 w-3.5 ml-2 text-gray-500 cursor-pointer hover:text-gray-800 transition-colors"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {selectedClass !== "all" && (
                <Badge variant="secondary" className="font-medium">
                  Class: {selectedClass}
                  <X
                    className="h-3.5 w-3.5 ml-2 cursor-pointer"
                    onClick={() => setSelectedClass("all")}
                  />
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="success" className="font-medium">
                  Price:
                  {priceRange === "under5000" && " Under ৳5,000"}
                  {priceRange === "5000-10000" && " ৳5,000 - ৳10,000"}
                  {priceRange === "over10000" && " Over ৳10,000"}
                  <X
                    className="h-3.5 w-3.5 ml-2 cursor-pointer"
                    onClick={() => setPriceRange("all")}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Count (Clearer display) */}
      <div className="flex justify-between items-center px-2">
        <p className="text-gray-600 text-lg font-medium">
          Showing{" "}
          <span className="text-emerald-600 font-extrabold text-xl">
            {
              // Simple filter logic for display purposes
              courses.filter(c => {
                const matchesSearch =
                  !searchQuery ||
                  c.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesClass =
                  selectedClass === "all" || c.classType === selectedClass;
                return matchesSearch && matchesClass;
              }).length
            }
          </span>{" "}
          Courses (Sorted by{" "}
          {sortBy === "popular"
            ? "Popularity"
            : sortBy.replace("-", " ").toUpperCase()}
          )
        </p>
      </div>
    </div>
  );
};

export default CourseFilter;
