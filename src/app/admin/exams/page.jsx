"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Plus, FileText, Calendar, Clock, Trash2, Edit, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AdminExamsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "admin" && user.role !== "teacher") {
        router.push("/");
        return;
      }
      fetchExams();
    }
  }, [user, authLoading, router]);

  const fetchExams = async () => {
    try {
      // Fetch all exams (using the public route for now, or a specific admin route if needed)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === 'success') {
        setExams(data.data.exams);
      }
    } catch (err) {
      console.error("Failed to fetch exams", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!confirm("Are you sure you want to delete this exam? This will also delete all associated results.")) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams/${examId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        // Refresh the exams list
        fetchExams();
        toast.success("Exam deleted successfully");
      } else {
        toast.error("Failed to delete exam");
      }
    } catch (err) {
      console.error("Failed to delete exam", err);
      toast.error("Network error");
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" className="p-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exam Management</h1>
                    <p className="text-gray-500 mt-1">Create and manage exams for your courses.</p>
                </div>
            </div>
            <Link href="/admin/exams/create">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Create New Exam
                </Button>
            </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search exams..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
            </div>
        </div>

        {/* Exam List */}
        {filteredExams.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Exams Found</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first exam.</p>
                <Link href="/admin/exams/create">
                    <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                        Create Exam
                    </Button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((exam) => (
                    <div key={exam._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => router.push(`/admin/exams/edit/${exam._id}`)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(exam._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{exam.title}</h3>
                        
                        <div className="space-y-2 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{exam.duration} minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {exam.totalMarks} Marks
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                Active
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
