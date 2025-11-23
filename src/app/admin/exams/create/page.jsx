"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus, Trash2, Save, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateExamPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [examData, setExamData] = useState({
    title: "",
    courseId: "",
    duration: 30, // minutes
    totalMarks: 0,
    passMarks: 0,
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOption: 0,
        marks: 1,
      },
    ],
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "admin" && user.role !== "teacher") {
        router.push("/");
        return;
      }
      fetchCourses();
    }
  }, [user, authLoading, router]);

  const fetchCourses = async () => {
    try {
      // Assuming we have a route to get all courses for admin/teacher
      // For now, using the public courses route or a specific admin route if available
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`);
      const data = await res.json();
      if (data.status === 'success') {
        setCourses(data.data.courses);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...examData.questions];
    newQuestions[index][field] = value;
    setExamData({ ...examData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...examData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setExamData({ ...examData, questions: newQuestions });
  };

  const addQuestion = () => {
    setExamData({
      ...examData,
      questions: [
        ...examData.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctOption: 0,
          marks: 1,
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    if (examData.questions.length === 1) return;
    const newQuestions = examData.questions.filter((_, i) => i !== index);
    setExamData({ ...examData, questions: newQuestions });
  };

  const calculateTotalMarks = () => {
    return examData.questions.reduce((acc, q) => acc + Number(q.marks), 0);
  };

  const handleSubmit = async () => {
    setError("");
    setSaving(true);

    // Basic Validation
    if (!examData.title || !examData.courseId) {
      setError("Please fill in all required fields.");
      setSaving(false);
      return;
    }

    const calculatedTotal = calculateTotalMarks();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...examData,
          totalMarks: calculatedTotal,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        setSuccess(true);
        setTimeout(() => {
            router.push(`/courses/${examData.courseId}`); // Redirect to course page or exam list
        }, 2000);
      } else {
        setError(data.message || "Failed to create exam.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
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
        <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="p-2">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create New Exam</h1>
            </div>
        </div>

        {success ? (
            <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-emerald-100">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Created Successfully!</h2>
                <p className="text-gray-500">Redirecting you back...</p>
            </div>
        ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Exam Details Section */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider">Exam Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Exam Title</label>
                    <input
                    type="text"
                    value={examData.title}
                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g., Physics Mid-Term"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Select Course</label>
                    <select
                    value={examData.courseId}
                    onChange={(e) => setExamData({ ...examData, courseId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
                    >
                    <option value="">-- Select a Course --</option>
                    {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                        {course.title}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Duration (Minutes)</label>
                    <input
                    type="number"
                    value={examData.duration}
                    onChange={(e) => setExamData({ ...examData, duration: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Pass Marks</label>
                    <input
                    type="number"
                    value={examData.passMarks}
                    onChange={(e) => setExamData({ ...examData, passMarks: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
                </div>
            </div>

            {/* Questions Section */}
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Questions ({examData.questions.length})</h2>
                    <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Total Marks: {calculateTotalMarks()}
                    </div>
                </div>

                <div className="space-y-8">
                {examData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 relative group">
                    <button
                        onClick={() => removeQuestion(qIndex)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove Question"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="mb-4 pr-8">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Question {qIndex + 1}</label>
                        <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none bg-white font-medium"
                        placeholder="Enter question text..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                            <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctOption === oIndex}
                            onChange={() => handleQuestionChange(qIndex, "correctOption", oIndex)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className={cn(
                                "flex-1 px-3 py-2 rounded-lg border outline-none text-sm transition-colors",
                                question.correctOption === oIndex 
                                ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 font-medium" 
                                : "border-gray-200 bg-white focus:border-emerald-300"
                            )}
                            placeholder={`Option ${oIndex + 1}`}
                            />
                        </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Marks:</label>
                            <input
                                type="number"
                                value={question.marks}
                                onChange={(e) => handleQuestionChange(qIndex, "marks", Number(e.target.value))}
                                className="w-20 px-2 py-1 rounded border border-gray-200 text-sm text-center font-bold"
                                min="1"
                            />
                        </div>
                    </div>
                    </div>
                ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={addQuestion}
                    variant="outline"
                    className="flex-1 border-dashed border-2 border-gray-300 text-gray-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 py-4 h-auto text-base font-bold"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add Question
                </Button>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                <div className="flex gap-4 ml-auto">
                    <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Create Exam
                    </Button>
                </div>
            </div>
            </div>
        )}
      </div>
    </div>
  );
}
