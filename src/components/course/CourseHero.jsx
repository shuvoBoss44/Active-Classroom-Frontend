// src/components/course/CourseHero.jsx
"use client";

import { motion } from "motion/react";
import { Search, Sparkles } from "lucide-react";

export default function CourseHero({ searchQuery, setSearchQuery, courseCount }) {
  return (
    <section className="relative overflow-hidden bg-gray-900 py-24 sm:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto mb-6 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              Unlock Your Potential
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Find the Perfect Course <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              For Your Future
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            Explore our curated collection of {courseCount}+ premium courses designed to help you master new skills and advance your career.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-10 max-w-xl"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for courses, topics, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full rounded-2xl border-0 bg-white/10 pl-12 pr-4 text-white placeholder:text-gray-400 backdrop-blur-md focus:bg-white/20 focus:ring-2 focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
