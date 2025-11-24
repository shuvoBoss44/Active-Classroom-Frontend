// app/admin/courses/create/page.jsx
"use client";

import { useState, useEffect } from "react"; // ADDED useEffect
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  Trash2,
  PlusCircle,
  Link,
  Users,
  CheckCircle,
} from "lucide-react"; // Added CheckCircle
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

// Helper component for a group of form fields
const FieldGroup = ({ title, description, children }) => (
  <div className="border-b border-gray-200 pb-8 last:border-b-0">
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    <p className="text-sm text-gray-500 mb-6 mt-1">{description}</p>
    <div className="space-y-6">{children}</div>
  </div>
);

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // 🎯 NEW STATE: Store the list of teachers fetched from the API
  const [availableTeachers, setAvailableTeachers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    classType: "HSC",
    price: "",
    discountedPrice: "",
    overview: "",
    description: "",
    faq: [{ question: "", answer: "" }],
    facebookGroupLink: "",
    demoVideo: "",
    // 🎯 NEW FIELD: Stores the IDs of selected instructors
    instructors: [],
    // 🎯 NEW FIELD: Facebook Group Videos
    facebookGroupVideos: [],
  });

  const [thumbnail, setThumbnail] = useState(null);

  // 🎯 NEW EFFECT: Fetch the list of all available teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/teacher`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          const teachers = data.data?.teachers || data.teachers || [];

          setAvailableTeachers(teachers);

          // Optionally, set the current admin/creator as the default instructor
          const creatorId = user?._id;
          if (creatorId && teachers.some(t => t._id === creatorId)) {
            setFormData(prev => ({ ...prev, instructors: [creatorId] }));
          }
        } else {
          console.error("Failed to fetch teachers.");
        }
      } catch (error) {
        console.error("Network error fetching teachers:", error);
      }
    };

    if (!authLoading && user?.role === "admin") {
      fetchTeachers();
    }
  }, [authLoading, user]);

  // Protect admin route (Use effect for client-side redirection after loading)
  if (!authLoading && (!user || user.role !== "admin")) {
    router.replace("/");
    return null;
  }
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Authorizing access...
          </p>
        </div>
      </div>
    );
  }

  // 🎯 NEW HANDLER: Toggles selection of an instructor by ID
  const handleInstructorToggle = teacherId => {
    setFormData(prev => {
      const currentInstructors = prev.instructors;

      if (currentInstructors.includes(teacherId)) {
        // Remove instructor
        return {
          ...prev,
          instructors: currentInstructors.filter(id => id !== teacherId),
        };
      } else {
        // Add instructor
        return {
          ...prev,
          instructors: [...currentInstructors, teacherId],
        };
      }
    });
  };

  // Handlers (kept as is)
  const handleFaqChange = (index, field, value) => {
    const newFaq = [...formData.faq];
    newFaq[index][field] = value;
    setFormData({ ...formData, faq: newFaq });
  };

  const addFaq = () => {
    setFormData({
      ...formData,
      faq: [...formData.faq, { question: "", answer: "" }],
    });
  };

  const removeFaq = index => {
    const newFaq = formData.faq.filter((_, i) => i !== index);
    setFormData({ ...formData, faq: newFaq });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!thumbnail) return toast.error("Thumbnail image is required!");
    if (formData.instructors.length === 0)
      return toast.error("At least one instructor is required!");

    setLoading(true);
    const data = new FormData();

    // 🎯 FIX: Explicitly check for 'faq', 'instructors', and 'facebookGroupVideos' and stringify them
    Object.keys(formData).forEach(key => {
      if (key === "faq" || key === "instructors" || key === "facebookGroupVideos") {
        // Send complex types (arrays) as JSON strings
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key]) {
        // Send simple types as strings
        data.append(key, formData[key]);
      }
    });

    // Append the thumbnail file
    data.append("thumbnail", thumbnail);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses`,
        {
          method: "POST",
          body: data,
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success("Course created successfully!");
        router.push("/admin/courses");
      } else {
        const error = await res.json();
        console.error("API Error:", error);
        toast.error(
          error.message ||
            "Failed to create course. Please check all required fields."
        );
      }
    } catch (err) {
      console.error("Network or Fetch Error:", err);
      toast.error("A network error occurred. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Shared Input Styles (kept as is)
  const inputStyle =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Course
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish a new learning resource to the platform.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-10">
          {/* 1. Basic Information */}
          <FieldGroup
            title="Basic Information"
            description="Course title, level, and enrollment details."
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                className={inputStyle}
                placeholder="HSC Physics - Complete Theory & Problem Solving"
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Class Type & Instructors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Level <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className={inputStyle}
                  onChange={e =>
                    setFormData({ ...formData, classType: e.target.value })
                  }
                  value={formData.classType}
                >
                  <option value="HSC">HSC</option>
                  <option value="SSC">SSC</option>
                  <option value="Admission">Admission</option>
                </select>
              </div>

              {/* 🎯 NEW: Instructor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructors <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                  {availableTeachers.length === 0 && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading teachers...
                    </p>
                  )}

                  <div className="space-y-2">
                    {availableTeachers.map(teacher => {
                      const isSelected = formData.instructors.includes(
                        teacher._id
                      );
                      return (
                        <div
                          key={teacher._id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                            isSelected
                              ? "bg-emerald-100 border border-emerald-500"
                              : "hover:bg-gray-100"
                          )}
                          onClick={() => handleInstructorToggle(teacher._id)}
                        >
                          <span className="text-sm font-medium text-gray-800">
                            {teacher.name} ({teacher.role || "Teacher"})
                          </span>
                          {isSelected ? (
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Users className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select all teachers who will be leading this course.
                </p>
              </div>
              {/* END NEW INSTRUCTOR SELECTION */}
            </div>
          </FieldGroup>

          {/* 2. Pricing & Media (kept as is) */}
          {/* ... (Pricing & Media FieldGroup content) ... */}
          <FieldGroup
            title="Pricing & Media"
            description="Set the course price and upload the primary thumbnail."
          >
            {/* Price Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (BDT) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  className={inputStyle}
                  placeholder="4990"
                  min="0"
                  onWheel={e => e.target.blur()}
                  onChange={e =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discounted Price (Optional)
                </label>
                <input
                  type="number"
                  className={inputStyle}
                  placeholder="3990"
                  min="0"
                  onWheel={e => e.target.blur()}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      discountedPrice: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail (Image file) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                onChange={e => setThumbnail(e.target.files[0])}
              />
            </div>
          </FieldGroup>

          {/* 3. Content Details (kept as is) */}
          {/* ... (Content Details FieldGroup content) ... */}
          <FieldGroup
            title="Content Details"
            description="Overview, detailed syllabus, and external links."
          >
            {/* Overview (Short Description) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overview (Short Summary)
              </label>
              <textarea
                rows={3}
                className={inputStyle}
                placeholder="A comprehensive course covering the full syllabus for high achievers."
                onChange={e =>
                  setFormData({ ...formData, overview: e.target.value })
                }
              />
            </div>

            {/* Description (Detailed Syllabus) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description / Syllabus
              </label>
              <textarea
                rows={6}
                className={inputStyle + " font-mono"}
                placeholder="Use bullet points for clarity. Example:&#10;• Chapter 1: Kinematics (5 Lectures)&#10;• 10 Model Tests&#10;• PDF Notes Included"
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* External Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demo Video Link (YouTube/Vimeo)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    className={inputStyle + " pl-10"}
                    placeholder="https://youtu.be/..."
                    onChange={e =>
                      setFormData({ ...formData, demoVideo: e.target.value })
                    }
                  />
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Group Link
                </label>
                <div className="relative">
                  <input
                    type="url"
                    className={inputStyle + " pl-10"}
                    placeholder="https://facebook.com/groups/..."
                    onChange={e =>
                      setFormData({
                        ...formData,
                        facebookGroupLink: e.target.value,
                      })
                    }
                  />
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </FieldGroup>

          {/* 4. FAQ Management (kept as is) */}
          {/* ... (FAQ FieldGroup content) ... */}
          <FieldGroup
            title="Frequently Asked Questions (FAQ)"
            description="Add key questions and answers for the course landing page."
          >
            <div className="space-y-4">
              {formData.faq.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50"
                >
                  {/* Question */}
                  <div className="w-full sm:w-1/2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Question
                    </label>
                    <input
                      required
                      className={inputStyle}
                      value={item.question}
                      onChange={e =>
                        handleFaqChange(index, "question", e.target.value)
                      }
                      placeholder="Who is this course for?"
                    />
                  </div>
                  {/* Answer */}
                  <div className="w-full sm:w-1/2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Answer
                    </label>
                    <input
                      required
                      className={inputStyle}
                      value={item.answer}
                      onChange={e =>
                        handleFaqChange(index, "answer", e.target.value)
                      }
                      placeholder="HSC 2026 science students."
                    />
                  </div>
                  {/* Remove Button */}
                  <div className="flex justify-end sm:block sm:mt-5">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFaq(index)}
                      className="flex-shrink-0 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addFaq}
              className="mt-4 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ Item
            </Button>
          </FieldGroup>

          {/* 5. Facebook Group Videos (NEW) */}
          <FieldGroup
            title="Facebook Group Videos"
            description="Add links to exclusive videos hosted in the Facebook group."
          >
            <div className="space-y-4">
              {formData.facebookGroupVideos.map((video, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50 items-end"
                >
                  <div className="w-full sm:flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Video Title
                    </label>
                    <input
                      required
                      className={inputStyle}
                      value={video.title}
                      onChange={e => {
                        const newVideos = [...formData.facebookGroupVideos];
                        newVideos[index].title = e.target.value;
                        setFormData({ ...formData, facebookGroupVideos: newVideos });
                      }}
                      placeholder="Lecture 1: Introduction"
                    />
                  </div>
                  <div className="w-full sm:flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Video URL
                    </label>
                    <input
                      required
                      type="url"
                      className={inputStyle}
                      value={video.url}
                      onChange={e => {
                        const newVideos = [...formData.facebookGroupVideos];
                        newVideos[index].url = e.target.value;
                        setFormData({ ...formData, facebookGroupVideos: newVideos });
                      }}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="w-full sm:flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Lecture Sheet URL (Optional)
                    </label>
                    <input
                      type="url"
                      className={inputStyle}
                      value={video.noteUrl || ""}
                      onChange={e => {
                        const newVideos = [...formData.facebookGroupVideos];
                        newVideos[index].noteUrl = e.target.value;
                        setFormData({ ...formData, facebookGroupVideos: newVideos });
                      }}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <div className="flex justify-end sm:block w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                            const newVideos = formData.facebookGroupVideos.filter((_, i) => i !== index);
                            setFormData({ ...formData, facebookGroupVideos: newVideos });
                        }}
                        className="h-10 w-10"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                  ...formData,
                  facebookGroupVideos: [...formData.facebookGroupVideos, { title: "", url: "" }]
              })}
              className="mt-4 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Video Link
            </Button>
          </FieldGroup>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                Publishing Course...
              </div>
            ) : (
              "PUBLISH COURSE"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
