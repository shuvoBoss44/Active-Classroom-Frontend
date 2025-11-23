"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, TrendingUp, Users, DollarSign, Calendar, ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days"); // 7days, 30days, 90days, 1year
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    activeStudents: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  
  console.log(revenueData)
  useEffect(() => {
    if (!authLoading && user) {
      if (!user.isAdmin) {
        router.push("/admin");
        return;
      }
      fetchAnalytics();
    }
  }, [user, authLoading, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch Dashboard Stats
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/dashboard`, { credentials: "include" });
      const statsJson = await statsRes.json();
      
      // Fetch Revenue Analytics
      const revRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/revenue?period=${period}`, { credentials: "include" });
      const revJson = await revRes.json();

      // Fetch Student Analytics
      const stuRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/students?period=${period}`, { credentials: "include" });
      const stuJson = await stuRes.json();

      if (statsJson.success) {
        setStats(statsJson.data);
      }

      if (revJson.success) {
        setRevenueData(revJson.data.data || []);
      }

      if (stuJson.success) {
        setStudentData(stuJson.data.data || []);
      }

    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && !stats.totalRevenue)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
              <p className="text-gray-500 mt-1">Overview of platform performance and growth.</p>
            </div>
          </div>

          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            {[
              { label: "7 Days", value: "7days" },
              { label: "30 Days", value: "30days" },
              { label: "90 Days", value: "90days" },
              { label: "1 Year", value: "1year" },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  period === p.value 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "text-gray-500 hover:bg-gray-50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <DollarSign className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                Total Revenue
              </span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-1">
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className="text-gray-500 font-medium">Lifetime Earnings</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Users className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                Total Students
              </span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-1">
              {stats.totalStudents.toLocaleString()}
            </h3>
            <p className="text-gray-500 font-medium">Registered Learners</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <BarChart3 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                Pending Exams
              </span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-1">
              {stats.pendingExams}
            </h3>
            <p className="text-gray-500 font-medium">Need Review</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Revenue Trend
            </h3>
            
            <div className="h-64 flex items-end gap-2">
              {revenueData.length > 0 ? (
                revenueData.map((item, index) => {
                  const maxVal = Math.max(...revenueData.map(d => d.revenue));
                  const height = maxVal > 0 ? (item.revenue / maxVal) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col justify-end group relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="bg-emerald-200 hover:bg-emerald-500 rounded-t-lg w-full transition-colors relative"
                      >
                         {/* Tooltip */}
                         <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                            {formatCurrency(item.revenue)}
                         </div>
                      </motion.div>
                      <p className="text-[10px] text-gray-400 text-center mt-2 truncate w-full">
                        {new Date(item._id).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No revenue data for this period
                </div>
              )}
            </div>
          </div>

          {/* Student Growth Chart */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Student Growth
            </h3>
            
            <div className="h-64 flex items-end gap-2">
              {studentData.length > 0 ? (
                studentData.map((item, index) => {
                  const maxVal = Math.max(...studentData.map(d => d.count));
                  const height = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col justify-end group relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="bg-blue-200 hover:bg-blue-500 rounded-t-lg w-full transition-colors relative"
                      >
                         {/* Tooltip */}
                         <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                            {item.count} Students
                         </div>
                      </motion.div>
                      <p className="text-[10px] text-gray-400 text-center mt-2 truncate w-full">
                        {new Date(item._id).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No student data for this period
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
