"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Clock, CheckCircle, ArrowRight, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ExamsListPage() {
  const { user, loading: authLoading } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchExams();
    }
  }, [authLoading]);

  const fetchExams = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === 'success') {
        setExams(data.data.exams);
      } else {
        setError("Failed to load exams.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">All Exams</h1>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {error}
            </div>
        )}

        {exams.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Exams Available</h3>
            <p className="text-gray-500">There are currently no exams scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {exams.map((exam) => (
              <div key={exam._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4" /> {exam.duration} mins
                        </span>
                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                            <CheckCircle className="w-4 h-4" /> {exam.totalMarks} Marks
                        </span>
                    </div>
                </div>
                <Link href={`/exams/${exam._id}`}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 w-full sm:w-auto">
                        Start Exam <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
