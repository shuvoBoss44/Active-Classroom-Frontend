// app/admin/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  FileText,
  Settings,
  Shield,
  Plus,
  BarChart3,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
// Assuming Card component is imported or defined elsewhere
// import { Card } from "@/components/ui/Card"; 
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Helper Component for Stat Cards
const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
        <Icon className="h-5 w-5" />
      </div>
      {trend && (
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trendUp
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          )}
        >
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

// Helper Component for Action Cards
const ActionCard = ({
  title,
  description,
  icon: Icon,
  colorClass,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className={cn(
          "p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform duration-300",
          colorClass
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
        <div className="p-2 text-gray-400 hover:text-emerald-600">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>
    </div>
    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
      {title}
    </h3>
    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingExams: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Define allowed roles for page view access
  const allowedRoles = ["admin", "moderator", "teacher"];
  // We'll rely on user?.role being available after useAuth loads
  const isAllowed = user && allowedRoles.includes(user.role);
  
  // Protected Route Logic - Allow admin, teacher, moderator
  useEffect(() => {
    // NOTE: Assuming user object from useAuth has .role, .isAdmin, .isModerator, .isTeacher
    // For simplicity, we are using the `isAllowed` check based on the defined roles.
    if (!authLoading && !isAllowed) {
      router.replace("/");
    }
  }, [user, authLoading, router, isAllowed]);

  // Fetch Real Dashboard Statistics - Only for admin
  useEffect(() => {
    // Use the explicit `isAdmin` check for privileged API calls
    const isAdmin = user && user.role === "admin"; 
    
    const fetchStats = async () => {
      if (isAdmin) {
        try {
          setStatsLoading(true);
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/dashboard`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) {
            throw new Error('Failed to fetch dashboard stats');
          }

          const data = await res.json();
          
          if (data.success && data.data) {
            setStats({
              totalStudents: data.data.totalStudents || 0,
              totalCourses: data.data.totalCourses || 0,
              totalRevenue: data.data.totalRevenue || 0,
              pendingExams: data.data.pendingExams || 0,
            });
          }
        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
          // Keep default values on error
        } finally {
          setStatsLoading(false);
        }
      } else {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Verifying Administrative Privileges...
          </p>
        </div>
      </div>
    );
  }

  // Use the explicit check derived from user.role for rendering
  if (!isAllowed) return null;

  // Determine what content to show based on role
  const isAdmin = user.role === "admin";
  const isContentManager = isAllowed; // True for admin, moderator, teacher

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* 1. Top Bar / Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user.name || "User"}. {isAdmin ? "Here is what's happening today." : "Manage your content and exams here."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-2",
                isAdmin ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-purple-50 text-purple-700 border-purple-100"
              )}>
                <Shield className="w-3 h-3" />
                {user.role.toUpperCase()}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                System Operational
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* 2. Statistics Overview - Admin Only */}
        {isAdmin && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading ? (
              // Loading Skeleton
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-gray-100 rounded-lg w-9 h-9"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Actual Stats
              <>
                <StatCard
                  title="Total Revenue"
                  value={`৳${(stats.totalRevenue / 100000).toFixed(1)} Lakh`}
                  icon={DollarSign}
                />
                <StatCard
                  title="Active Students"
                  value={stats.totalStudents.toLocaleString()}
                  icon={Users}
                />
                <StatCard
                  title="Live Courses"
                  value={stats.totalCourses}
                  icon={BookOpen}
                />
                <StatCard
                  title="Pending Reviews"
                  value={stats.pendingExams}
                  icon={AlertCircle}
                />
              </>
            )}
          </section>
        )}

        {/* 3. Quick Actions Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {isAdmin ? "Management Console" : "Content & Exam Management"}
            </h2>
            {!isAdmin && (
              <span className="text-xs text-gray-500">
                Content and Exam management access
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* --- Shared Access Cards (Admin, Moderator, Teacher) --- */}
            
            {/* Exam Management - Available to all roles */}
            <ActionCard
              title="Exam Control"
              description="Create model tests, question papers, and view results."
              icon={GraduationCap}
              colorClass="text-purple-600 bg-purple-50"
              onClick={() => router.push("/admin/exams")}
            />
            
            {/* Manage Content - Available to all roles (NEW LOCATION) */}
            <ActionCard
                title="Manage Content"
                description="Edit existing courses, chapters, and lecture materials."
                icon={BookOpen}
                colorClass="text-blue-600 bg-blue-50"
                onClick={() => router.push("/admin/courses")}
            />
            
            {/* --- Admin-only content --- */}
            
            {isAdmin && (
              <>
                {/* Course Creation (Admin-only) */}
                <ActionCard
                  title="Create Course"
                  description="Launch a new course, upload thumbnails, and set pricing."
                  icon={Plus}
                  colorClass="text-emerald-600 bg-emerald-50"
                  onClick={() => router.push("/admin/courses/create")}
                />
                
                {/* Central Notes (Admin-only) */}
                <ActionCard
                  title="Central Notes"
                  description="Upload and manage public study resources."
                  icon={FileText}
                  colorClass="text-indigo-600 bg-indigo-50"
                  onClick={() => router.push("/admin/notes")}
                />

                {/* Student & User Management (Admin-only) */}
                <ActionCard
                  title="User Directory"
                  description="Manage students, promote teachers, and handle bans."
                  icon={Users}
                  colorClass="text-orange-600 bg-orange-50"
                  onClick={() => router.push("/admin/users")}
                />

                {/* Business & Settings (Admin-only) */}
                <ActionCard
                  title="Coupons & Offers"
                  description="Create discount codes and manage active promotions."
                  icon={Shield}
                  colorClass="text-pink-600 bg-pink-50"
                  onClick={() => router.push("/admin/coupons")}
                />
                <ActionCard
                  title="Analytics"
                  description="Detailed breakdown of revenue and student growth."
                  icon={BarChart3}
                  colorClass="text-cyan-600 bg-cyan-50"
                  onClick={() => router.push("/admin/analytics")}
                />
                <ActionCard
                  title="Platform Settings"
                  description="Update homepage content, contact info, and SEO."
                  icon={Settings}
                  colorClass="text-gray-600 bg-gray-100"
                  onClick={() => router.push("/admin/settings")}
                />
              </>
            )}
          </div>
        </section>

        {/* 4. Footer / System Info */}
        <div className="mt-12 border-t border-gray-200 pt-6 flex justify-between text-xs text-gray-400">
          <p>Active Classroom Admin v2.0.5</p>
          <p>Server Status: Stable • Database: Connected</p>
        </div>
      </div>
    </div>
  );
}