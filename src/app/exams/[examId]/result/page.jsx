"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle, XCircle, Trophy, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ExamResultPage({ params }) {
  const router = useRouter();
  const { examId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      fetchResults();
    }
  }, [user, authLoading, examId]);

  const fetchResults = async () => {
    try {
      // Fetch the latest result for this exam
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams/results/me`, {
        credentials: "include",
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        // Filter for the specific exam result
        const examResult = data.data.results.find(r => r.examId._id === examId || r.examId === examId);
        if (examResult) {
            setResults(examResult);
        } else {
            setError("Result not found.");
        }
      } else {
        setError("Failed to load results.");
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

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Result Not Found</h2>
            <p className="text-gray-500 mb-6">{error || "You haven't taken this exam yet."}</p>
            <Link href={`/exams/${examId}`}>
                <Button>Take Exam</Button>
            </Link>
        </div>
      </div>
    );
  }

  const percentage = Math.round((results.score / results.totalMarks) * 100);
  const isPassed = percentage >= 40; // Assuming 40% pass mark for now, ideally from exam model

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Score Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8 text-center p-10 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
            
            <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4",
                isPassed ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
            )}>
                <Trophy className={cn("w-10 h-10", isPassed ? "text-emerald-600" : "text-red-500")} />
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2">
                {isPassed ? "Congratulations!" : "Keep Practicing!"}
            </h1>
            <p className="text-gray-500 mb-8 font-medium">
                You have successfully completed the exam.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Score</p>
                    <p className="text-2xl font-black text-gray-900">{results.score}/{results.totalMarks}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Correct</p>
                    <p className="text-2xl font-black text-emerald-600">{results.correctAnswers}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Wrong</p>
                    <p className="text-2xl font-black text-red-500">{results.wrongAnswers}</p>
                </div>
            </div>
        </div>

        {/* Answer Breakdown (Optional - if we want to show detailed feedback) */}
        {/* We can add this later if needed, currently the Result model stores answers but we aren't fetching full question text here unless we populate exam questions */}

        <div className="flex justify-center gap-4">
            <Link href="/courses">
                <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                </Button>
            </Link>
            <Link href={`/exams/${examId}`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                    <RotateCcw className="w-4 h-4 mr-2" /> Retake Exam
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
