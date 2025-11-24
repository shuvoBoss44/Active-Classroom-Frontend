// app/admin/courses/[courseId]/edit/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button"; // Assuming you have a Button component
import {
  Loader2,
  Trash2,
  PlusCircle,
  Link,
  Users,
  Edit,
  Image as ImageIcon,
  CheckCircle, 
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming cn utility
import Image from "next/image";
import { toast } from "react-hot-toast";

// Helper component for a group of form fields
const FieldGroup = ({ title, description, children }) => (
  <div className="border-b border-gray-200 pb-8 last:border-b-0">
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    <p className="text-sm text-gray-500 mb-6 mt-1">{description}</p>
    <div className="space-y-6">{children}</div>
  </div>
);

// Shared Input Styles
const inputStyle =
  "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder-gray-400";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId; // Get ID from URL

  // --- AUTH HOOK ---
  const { user, loading } = useAuth();
  
  // Define roles allowed to access this page
  const allowedRoles = ["admin", "moderator", "teacher"];
  const isAllowed = user && allowedRoles.includes(user.role);

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
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
    instructors: [],
    facebookGroupVideos: [],
  });

  const [availableTeachers, setAvailableTeachers] = useState([]);

  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState(null);
  const [newThumbnailFile, setNewThumbnailFile] = useState(null);

  // --- 1. Access Protection & Initial Data Fetch ---
  useEffect(() => {
    const isCurrentUserAllowed = user && allowedRoles.includes(user.role);
    
    // 1a. Route Protection
    // IMPORTANT: Use local `loading` state here
    if (!loading && !isCurrentUserAllowed) {
      router.replace("/");
      return;
    }

    // 1b. Data Fetching
    if (isCurrentUserAllowed && courseId) { // Check for ANY allowed role
        
        // Fetch Teachers - All allowed users can select instructors
        const fetchTeachers = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/users/teacher`,
                    { credentials: "include" }
                );
                if (res.ok) {
                    const data = await res.json();
                    setAvailableTeachers(data.data?.teachers || data.teachers || []);
                }
            } catch (error) {
                console.error("Error fetching teachers:", error);
            }
        };
        fetchTeachers(); 

      const fetchCourse = async () => {
        setInitialLoading(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`,
            { credentials: "include", method: "GET" }
          );

          if (!res.ok) throw new Error("Failed to fetch course details.");

          const data = await res.json();
          const course = data.course || data.data.course;

          setFormData({
            title: course.title || "",
            classType: course.classType || "HSC",
            price: course.price || "",
            discountedPrice: course.discountedPrice || "",
            overview: course.overview || "",
            description: course.description || "",
            faq:
              course.faq?.length > 0
                ? course.faq
                : [{ question: "", answer: "" }],
            facebookGroupLink: course.facebookGroupLink || "",
            demoVideo: course.demoVideo || "",
            facebookGroupVideos: course.facebookGroupVideos || [],
            instructors: course.instructors ? course.instructors.map(i => i._id || i) : [],
          });
          setCurrentThumbnailUrl(course.thumbnail);
        } catch (err) {
          console.error("Fetch Error:", err);
          toast.error("Could not load course. Check console for details.");
        } finally {
          setInitialLoading(false);
        }
      };
      fetchCourse();
    }
  }, [user, loading, router, courseId]); // 🎯 FIX: Changed authLoading to local loading

  // --- 2. FAQ Management Handlers ---
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

  // --- 3. Submission Handler (PUT Request) ---
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();

    // Append all form data fields
    Object.keys(formData).forEach(key => {
      if (key === "faq" || key === "instructors" || key === "facebookGroupVideos") {
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== undefined && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    if (newThumbnailFile) {
      data.append("thumbnail", newThumbnailFile);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`,
        {
          method: "PUT",
          body: data,
          credentials: "include",
        }
      );

      if (res.ok) {
        toast.success("Course updated successfully! 🎉");
        router.push("/admin/courses");
      } else {
        const error = await res.json();
        console.error("API Error:", error);
        toast.error(
          error.message ||
            "Failed to update course. Please check all required fields."
        );
      }
    } catch (err) {
      console.error("Network or Fetch Error:", err);
      toast.error("A network error occurred. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- 4. Loading and Auth Check ---
  // 🎯 FIX: Changed authLoading to local loading
  if (loading || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Loading course ID: {courseId}...
          </p>
        </div>
      </div>
    );
  }

  // Final access check: if not allowed, render nothing (user was redirected in useEffect)
  if (!isAllowed) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER: Added px-4 for smaller screens */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Edit className="h-6 w-6 text-emerald-600 flex-shrink-0" />
            Edit Course:{" "}
            <span className="text-emerald-700 truncate">{formData.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Updating course ID:{" "}
            <span className="font-mono text-gray-600">{courseId}</span>
          </p>
        </div>
      </header>

      {/* FORM CONTAINER: Added px-4 for smaller screens, reduced max-width slightly for mobile comfort */}
      <form
        onSubmit={handleSubmit}
        className="max-w-xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-8"
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 space-y-8 sm:space-y-10">
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
                value={formData.title}
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
                  value={formData.classType}
                  onChange={e =>
                    setFormData({ ...formData, classType: e.target.value })
                  }
                >
                  <option value="HSC">HSC</option>
                  <option value="SSC">SSC</option>
                  <option value="Admission">Admission</option>
                </select>
              </div>
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
                          onClick={() => {
                            setFormData(prev => {
                                const current = prev.instructors;
                                if (current.includes(teacher._id)) {
                                    return { ...prev, instructors: current.filter(id => id !== teacher._id) };
                                } else {
                                    return { ...prev, instructors: [...current, teacher._id] };
                                }
                            });
                          }}
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
              </div>
            </div>
          </FieldGroup>

          {/* 2. Pricing & Media */}
          <FieldGroup
            title="Pricing & Media"
            description="Set the course price and update the primary thumbnail."
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
                  value={formData.price}
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
                  value={formData.discountedPrice}
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

            {/* Thumbnail Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Thumbnail
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Thumbnail Preview */}
                {currentThumbnailUrl ? (
                  <div className="relative h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <Image
                      src={currentThumbnailUrl}
                      alt="Current thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-32 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 flex-shrink-0">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}

                {/* File Input */}
                <div className="flex-grow w-full">
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a new image to replace the current one.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    onChange={e => setNewThumbnailFile(e.target.files[0])}
                  />
                </div>
              </div>
            </div>
          </FieldGroup>

          {/* 3. Content Details */}
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
                value={formData.overview}
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
                value={formData.description}
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
                    value={formData.demoVideo}
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
                    value={formData.facebookGroupLink}
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

          {/* 4. FAQ Management (Dynamic Array) */}
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
                  {/* Question Field */}
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
                  {/* Answer Field */}
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
                  <div className="sm:mt-0 flex sm:block justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFaq(index)}
                      className="flex-shrink-0 h-8 w-8 mt-1 sm:mt-5"
                      disabled={formData.faq.length === 1} // Disable delete if only one item left
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
            disabled={submitting}
            className="w-full py-3 text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                SAVING CHANGES...
              </div>
            ) : (
              "SAVE CHANGES"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}