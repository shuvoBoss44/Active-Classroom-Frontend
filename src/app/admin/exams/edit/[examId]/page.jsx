"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditExamPage({ params }) {
  const router = useRouter();
  const { examId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [examData, setExamData] = useState({
    title: "",
    courseId: "",
    duration: 30,
    totalMarks: 0,
    passMarks: 0,
    questions: [],
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (!user.canAccessDashboard) {
        router.push("/");
        return;
      }
      fetchCourses();
      fetchExam();
    }
  }, [user, authLoading, router, examId]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`);
      const data = await res.json();
      if (data.status === 'success') {
        setCourses(data.data.courses);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const fetchExam = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams/${examId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === 'success') {
        const exam = data.data.exam;
        setExamData({
          title: exam.title,
          courseId: exam.courseId._id || exam.courseId,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          passMarks: exam.passMarks,
          questions: exam.questions,
        });
      }
    } catch (err) {
      console.error("Failed to fetch exam", err);
      setError("Failed to load exam");
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

    // Validation
    if (!examData.title || !examData.courseId) {
      setError("Please fill in all required fields");
      setSaving(false);
      return;
    }

    const totalMarks = calculateTotalMarks();
    const payload = {
      ...examData,
      totalMarks,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/exams");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update exam");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Edit Exam</h1>
            <p className="text-gray-500 mt-1">Update exam details and questions</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Exam Title *
              </label>
              <input
                type="text"
                value={examData.title}
                onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                placeholder="e.g., Physics Mid-term Exam"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Select Course *
              </label>
              <select
                value={examData.courseId}
                onChange={(e) => setExamData({ ...examData, courseId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              >
                <option value="">Choose a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={examData.duration}
                  onChange={(e) => setExamData({ ...examData, duration: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pass Marks
                </label>
                <input
                  type="number"
                  value={examData.passMarks}
                  onChange={(e) => setExamData({ ...examData, passMarks: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={calculateTotalMarks()}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Questions</h2>
              <Button onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </div>

            {examData.questions.map((question, qIndex) => (
              <div key={qIndex} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Question {qIndex + 1}
                    </label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                      rows={2}
                      placeholder="Enter question text"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => handleQuestionChange(qIndex, "marks", Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-center"
                      placeholder="Marks"
                    />
                    {examData.questions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Options</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctOption === oIndex}
                        onChange={() => handleQuestionChange(qIndex, "correctOption", oIndex)}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Exam
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
