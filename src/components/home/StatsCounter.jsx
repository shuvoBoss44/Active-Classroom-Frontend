// src/components/home/StatsCounter.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Users, BookOpen, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useInView } from "motion/react";

const statItems = [
  {
    key: "students",
    label: "Active Students",
    icon: Users,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    key: "courses",
    label: "Premium Courses",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "exams",
    label: "Total Exams",
    icon: Award,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export default function StatsCounter({
  totalStudents = 15000,
  totalCourses = 50,
  totalExams = 800,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [counts, setCounts] = useState({ students: 0, courses: 0, exams: 0 });

  const totals = {
    students: totalStudents,
    courses: totalCourses,
    exams: totalExams,
  };

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const newCounts = {};

      statItems.forEach(item => {
        const total = totals[item.key];
        const increment = total / steps;
        newCounts[item.key] = Math.min(Math.floor(current * increment), total);
      });

      setCounts(newCounts);

      if (current >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, totalStudents, totalCourses, totalExams]);

  return (
    <div ref={ref} className="bg-white py-20 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            const count = counts[item.key];
            const totalCount = totals[item.key];

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group p-6 md:p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", item.bg)}>
                    <Icon className={cn("h-8 w-8", item.color)} />
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                      {count.toLocaleString()}
                      {count === totalCount ? "+" : ""}
                    </p>
                    <p className="text-lg font-medium text-gray-500 mt-1">
                      {item.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
