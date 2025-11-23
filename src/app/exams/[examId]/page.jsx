"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Clock, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ExamPage({ params }) {
  const router = useRouter();
  const { examId } = use(params);
  const { user, loading: authLoading } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Exam State
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchExam();
    }
  }, [user, authLoading, examId]);

  // Timer Effect
  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const fetchExam = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams/${examId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === 'success') {
        setExam(data.data.exam);
        setTimeLeft(data.data.exam.duration * 60);
      } else {
        setError("Failed to load exam.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !confirm("Are you sure you want to submit?")) return;

    setSubmitting(true);
    try {
      // Format answers for backend
      const formattedAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
        questionId: qId,
        selectedOption: optIdx
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          examId,
          answers: formattedAnswers
        }),
      });

      const data = await res.json();
      if (res.ok) { // Check res.ok instead of just data.success/status
        router.push(`/exams/${examId}/result`);
      } else {
        setError(data.message || "Submission failed.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("Network error during submission.");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Exam Not Found</h2>
            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  // Start Screen
  if (!examStarted) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-emerald-600" /> {/* Changed icon to FileText as CheckCircle2 was imported but not used here contextually */}
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">{exam.title}</h1>
                <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500 mb-8">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exam.duration} mins</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {exam.totalMarks} Marks</span>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-left mb-8">
                    <h3 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Instructions
                    </h3>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                        <li>The timer will start immediately after you click "Start Exam".</li>
                        <li>You cannot pause the exam once started.</li>
                        <li>The exam will auto-submit when the time runs out.</li>
                    </ul>
                </div>

                <Button 
                    onClick={() => setExamStarted(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 text-lg"
                >
                    Start Exam
                </Button>
            </div>
        </div>
    );
  }

  // Exam Interface
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">{exam.title}</h2>
            <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg tabular-nums",
                timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-700"
            )}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
            </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {exam.questions.map((question, index) => (
            <div key={question._id} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-lg text-sm flex-shrink-0">
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
                    {question.options.map((option, optIndex) => (
                        <label 
                            key={optIndex}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all group",
                                answers[question._id] === optIndex
                                    ? "border-emerald-500 bg-emerald-50/50"
                                    : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                answers[question._id] === optIndex
                                    ? "border-emerald-500 bg-emerald-500"
                                    : "border-gray-300 group-hover:border-emerald-400"
                            )}>
                                {answers[question._id] === optIndex && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </div>
                            <input
                                type="radio"
                                name={question._id}
                                className="hidden"
                                checked={answers[question._id] === optIndex}
                                onChange={() => handleOptionSelect(question._id, optIndex)}
                            />
                            <span className={cn(
                                "text-base font-medium",
                                answers[question._id] === optIndex ? "text-emerald-900" : "text-gray-700"
                            )}>
                                {option}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        ))}

        <div className="flex justify-end pt-4">
            <Button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 text-lg w-full sm:w-auto"
            >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Exam"}
            </Button>
        </div>
      </div>
    </div>
  );
}

// Helper Icon
function FileText(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
      </svg>
    )
  }
