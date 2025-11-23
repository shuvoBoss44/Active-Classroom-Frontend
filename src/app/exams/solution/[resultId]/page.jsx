"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle, XCircle, ArrowLeft, Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SolutionPage({ params }) {
  const router = useRouter();
  const { resultId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      fetchResult();
    }
  }, [user, authLoading, resultId]);

  const fetchResult = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams/results/${resultId}`, {
        credentials: "include",
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setResult(data.data.result);
      } else {
        setError(data.message || "Failed to load solution.");
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

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Solution</h2>
            <p className="text-gray-500 mb-6">{error || "Solution not found."}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.totalMarks) * 100);
  const isPassed = percentage >= 40;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/profile">
                <Button variant="ghost" className="p-2">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exam Solution</h1>
                <p className="text-gray-500 mt-1">{result.examId?.title}</p>
            </div>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center border-4",
                    isPassed ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                )}>
                    <Trophy className={cn("w-8 h-8", isPassed ? "text-emerald-600" : "text-red-500")} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Your Score</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900">{result.score}</span>
                        <span className="text-gray-400 font-bold">/{result.totalMarks}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-8 text-center sm:text-right">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Correct</p>
                    <p className="text-2xl font-black text-emerald-600">{result.correctAnswers}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Wrong</p>
                    <p className="text-2xl font-black text-red-500">{result.wrongAnswers}</p>
                </div>
            </div>
        </div>

        {/* Questions Breakdown */}
        <div className="space-y-6">
            {result.examId?.questions.map((question, index) => {
                // Find user's answer for this question
                const userAnswer = result.answers.find(a => a.questionId === question._id);
                const isCorrect = userAnswer?.isCorrect;
                const userSelectedOption = userAnswer?.selectedOption;

                return (
                    <div key={question._id} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-4 mb-6">
                            <span className={cn(
                                "font-bold px-3 py-1 rounded-lg text-sm flex-shrink-0",
                                isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            )}>
                                Q{index + 1}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 leading-relaxed">
                                {question.questionText}
                            </h3>
                            <span className="ml-auto text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                {question.marks} Marks
                            </span>
                        </div>

                        <div className="space-y-3">
                            {question.options.map((option, optIndex) => {
                                const isUserSelected = userSelectedOption === optIndex;
                                const isCorrectOption = question.correctOption === optIndex;

                                let optionStyle = "border-gray-100 bg-white text-gray-700";
                                let icon = null;

                                if (isCorrectOption) {
                                    optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                                    icon = <CheckCircle className="w-5 h-5 text-emerald-600" />;
                                } else if (isUserSelected && !isCorrectOption) {
                                    optionStyle = "border-red-500 bg-red-50 text-red-900";
                                    icon = <XCircle className="w-5 h-5 text-red-500" />;
                                }

                                return (
                                    <div 
                                        key={optIndex}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                                            optionStyle
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold text-xs",
                                            isCorrectOption ? "border-emerald-500 text-emerald-600" : 
                                            (isUserSelected ? "border-red-500 text-red-500" : "border-gray-300 text-gray-400")
                                        )}>
                                            {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <span className="text-base font-medium flex-1">
                                            {option}
                                        </span>
                                        {icon}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {!isCorrect && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-800 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold">Correct Answer: </span>
                                    {question.options[question.correctOption]}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
