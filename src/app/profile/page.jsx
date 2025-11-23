// app/profile/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import CourseCard from "@/components/course/CourseCard";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  School,
  BookOpen,
  Trophy,
  LogOut,
  User,
  Heart,
  Settings,
  Calendar,
  Link2,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Hash,
  GraduationCap
} from "lucide-react";

// --- UTILITIES ---

// strictly map schema fields to form state
const initializeFormData = userData => ({
  name: userData?.name || "",
  phone: userData?.phone || "",
  guardianPhone: userData?.guardianPhone || "",
  school: userData?.school || "",
  college: userData?.college || "",
  session: userData?.session || "",
  facebookId: userData?.facebookId || "",
  // Read-only fields kept for reference in state if needed, though not sent in PUT
  email: userData?.email || "",
  userId: userData?.userId || "",
});

// --- UI COMPONENTS ---

const CustomInput = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
  required = false,
  icon: Icon,
}) => (
  <div className="space-y-1.5 w-full">
    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      type={type}
      className={cn(
        "w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm",
        "placeholder:text-gray-400 focus:ring-4 focus:ring-emerald-500/10 outline-none",
        disabled
          ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
          : "bg-white text-gray-900 border-gray-200 hover:border-emerald-400 focus:border-emerald-500"
      )}
      placeholder={placeholder}
    />
  </div>
);

const InfoItem = ({ icon: Icon, label, value, isLink }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
      <Icon className="w-6 h-6 text-emerald-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-medium text-gray-900 truncate",
          isLink && "text-blue-600 hover:underline cursor-pointer"
        )}
      >
        {value || (
          <span className="text-gray-400 italic font-normal">Not provided</span>
        )}
      </p>
    </div>
  </div>
);

const SuccessNotification = ({ message, onClose }) => (
  <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-500">
    <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 flex items-start gap-4 max-w-sm">
      <div className="bg-emerald-100 p-2 rounded-full">
         <CheckCircle2 className="w-6 h-6 text-emerald-600" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-900">Success</h4>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-auto text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ------------------------------------------------------------------------

export default function ProfilePage() {
  const { getMe } = useAuth(); // Get the getMe function to refresh auth context
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showSuccess, setShowSuccess] = useState(false);
  const [courseProgress, setCourseProgress] = useState({});
  const [examResults, setExamResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          return;
        }
        setError("Failed to load profile.");
        return;
      }

      const result = await res.json();
      const userData = result?.data?.user || result?.user || result;

      if (!userData || !userData.email) {
        setError("Invalid user data received.");
        return;
      }

      setUser(userData);
      setFormData(initializeFormData(userData));
      setError("");

      // Fetch progress for enrolled courses
      if (userData.purchasedCourses && userData.purchasedCourses.length > 0) {
        fetchProgress(userData.purchasedCourses);
      }

    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (courses) => {
    const progressMap = {};
    await Promise.all(courses.map(async (course) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/${course._id}`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    progressMap[course._id] = data.data;
                }
            }
        } catch (error) {
            console.error(`Failed to fetch progress for course ${course._id}`, error);
        }
    }));
    setCourseProgress(progressMap);
  };

  const fetchExamResults = async () => {
    setLoadingResults(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exams/results/me`, {
            credentials: "include"
        });
        const data = await res.json();
        if (data.status === 'success') {
            setExamResults(data.data.results);
        }
    } catch (error) {
        console.error("Failed to fetch exam results", error);
    } finally {
        setLoadingResults(false);
    }
  };

  useEffect(() => {
    if (activeTab === "exams") {
        fetchExamResults();
    }
  }, [activeTab]);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    if (!formData.name) {
      setError("Name is required.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            guardianPhone: formData.guardianPhone,
            school: formData.school,
            college: formData.college,
            session: formData.session,
            facebookId: formData.facebookId,
            profileImage: formData.profileImage,
          }),
        }
      );

      const responseBody = await res.json();
      if (!res.ok) throw new Error(responseBody.message || "Save failed");

      const updatedUser = responseBody.data?.user || { ...user, ...formData };
      setUser(updatedUser);
      setFormData(initializeFormData(updatedUser));
      setEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = "/login";
  };

  const handleCancel = () => {
    setFormData(initializeFormData(user));
    setEditing(false);
    setError("");
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900">
      {showSuccess && (
        <SuccessNotification
          message="Profile updated successfully!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* --- HEADER SECTION --- */}
      <div className="bg-white border-b border-gray-200 shadow-sm relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* User Identity */}
          <div className="py-10 flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full p-1 bg-white border-4 border-emerald-50 shadow-xl overflow-hidden relative">
                <Image
                  src={user?.profileImage || "/default-avatar.png"}
                  alt={user?.name}
                  width={128}
                  height={128}
                  className="rounded-full object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Upload Overlay */}
                <label 
                  htmlFor="profile-upload"
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full z-10"
                >
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                    <Edit2 className="w-5 h-5 text-white" />
                  </div>
                </label>
                <input 
                  id="profile-upload"
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        setError("Please upload an image file (JPEG, PNG, WebP).");
                        return;
                    }

                    // Validate file size (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        setError("Image size should be less than 5MB.");
                        return;
                    }

                    try {
                        setSaving(true);
                        const formData = new FormData();
                        formData.append('image', file);

                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile/upload-image`, {
                            method: 'POST',
                            body: formData,
                            credentials: 'include',
                        });

                        const data = await res.json();
                        console.log("Upload response:", data);
                        console.log("Response status:", res.status);
                        console.log("Response ok:", res.ok);

                        if (res.ok && data.status === 'success') {
                            // Update local user state
                            setUser(prev => ({ ...prev, profileImage: data.data.user.profileImage }));
                            setFormData(prev => ({ ...prev, profileImage: data.data.user.profileImage }));
                            
                            // CRITICAL: Refresh auth context to update Navbar and other components
                            try {
                                await getMe();
                            } catch (authError) {
                                console.error("Failed to refresh auth:", authError);
                                // Continue anyway - local state is updated
                            }
                            
                            setShowSuccess(true);
                            setTimeout(() => setShowSuccess(false), 3000);
                        } else {
                            console.error("Upload failed:", data);
                            console.error("Full response:", { status: res.status, ok: res.ok, data });
                            setError(data.message || "Failed to upload image.");
                        }
                    } catch (err) {
                        console.error("Upload error:", err);
                        setError("Failed to upload image. Check console for details.");
                    } finally {
                        setSaving(false);
                    }
                  }}
                />
              </div>
              <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white uppercase tracking-wide shadow-md z-20">
                {user?.role}
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{user?.name}</h1>
              <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-2 font-medium">
                <Mail className="w-4 h-4 text-emerald-500" /> {user?.email}
              </p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                {user?.phone && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> {user.phone}
                  </span>
                )}
                {user?.session && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {user.session}
                  </span>
                )}
              </div>
            </div>

            {/* Top Actions */}
            <div className="flex items-center gap-3 mt-6 md:mt-0">
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 rounded-xl px-6"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl px-6"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 mt-8 -mb-px overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === "overview"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <User className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={cn(
                "pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === "courses"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <GraduationCap className="w-4 h-4" /> Enrolled Courses
              <span className="ml-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-extrabold">
                {user?.purchasedCourses?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("exams")}
              className={cn(
                "pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === "exams"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Trophy className="w-4 h-4" /> Exam History
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ERROR ALERT */}
        {editing && error && (
          <div className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
            <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-red-900">Error</h4>
                <p className="text-sm font-medium text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* --- VIEW: OVERVIEW --- */}
        {activeTab === "overview" && (
          <div className="animate-in fade-in duration-500">
            {editing ? (
              // --- EDIT FORM (Full Schema Coverage) ---
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900">
                    Edit Profile Details
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid gap-10">
                  {/* 1. Personal Info */}
                  <section className="space-y-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomInput
                        label="Full Name"
                        value={formData.name}
                        onChange={e =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        icon={User}
                      />
                      <CustomInput
                        label="Phone Number"
                        value={formData.phone}
                        onChange={e =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        icon={Phone}
                      />
                      <CustomInput
                        label="Facebook Username/Link"
                        value={formData.facebookId}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            facebookId: e.target.value,
                          })
                        }
                        placeholder="fb.com/username"
                        icon={Link2}
                      />
                    </div>
                  </section>

                  {/* 2. Guardian Info */}
                  <section className="space-y-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" /> Guardian Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomInput
                        label="Guardian Phone"
                        value={formData.guardianPhone}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            guardianPhone: e.target.value,
                          })
                        }
                        placeholder="+880..."
                        icon={Smartphone}
                      />
                    </div>
                  </section>

                  {/* 3. Academic Info */}
                  <section className="space-y-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                       <School className="w-4 h-4" /> Academic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomInput
                        label="Academic Session"
                        value={formData.session}
                        onChange={e =>
                          setFormData({ ...formData, session: e.target.value })
                        }
                        placeholder="e.g., 2025-26"
                        icon={Calendar}
                      />
                      <CustomInput
                        label="School Name"
                        value={formData.school}
                        onChange={e =>
                          setFormData({ ...formData, school: e.target.value })
                        }
                        icon={School}
                      />
                      <CustomInput
                        label="College Name"
                        value={formData.college}
                        onChange={e =>
                          setFormData({ ...formData, college: e.target.value })
                        }
                        icon={Building2}
                      />
                    </div>
                  </section>
                </div>

                <div className="mt-12 flex items-center gap-4 border-t border-gray-100 pt-8">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl text-base font-bold shadow-lg shadow-emerald-500/20"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Save className="w-5 h-5 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    className="text-gray-600 hover:bg-gray-100 px-8 py-6 rounded-xl text-base font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // --- READ ONLY VIEW (Full Schema Coverage) ---
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Detailed Info */}
                <div className="lg:col-span-2 space-y-8">
                  <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" /> Personal &
                      Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoItem
                        icon={User}
                        label="Full Name"
                        value={user.name}
                      />
                      <InfoItem
                        icon={Phone}
                        label="Phone Number"
                        value={user.phone}
                      />
                      <InfoItem
                        icon={Smartphone}
                        label="Guardian Phone"
                        value={user.guardianPhone}
                      />
                      <InfoItem
                        icon={Link2}
                        label="Facebook ID"
                        value={user.facebookId}
                      />
                    </div>
                  </section>

                  <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <School className="w-5 h-5 text-emerald-600" /> Academic
                      Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoItem
                        icon={Calendar}
                        label="Session"
                        value={user.session}
                      />
                      <InfoItem
                        icon={School}
                        label="School"
                        value={user.school}
                      />
                      <InfoItem
                        icon={Building2}
                        label="College"
                        value={user.college}
                      />
                    </div>
                  </section>
                </div>

                {/* Right Col: System Info */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-24">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-4">
                      System Data
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          User ID
                        </p>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 font-mono text-xs text-gray-600 break-all flex items-center gap-2">
                          <Hash className="w-3 h-3 text-gray-400" /> {user.userId}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Registered Email
                        </p>
                        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-emerald-500" />
                            {user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Account Role
                        </p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: COURSES --- */}
        {activeTab === "courses" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {user?.purchasedCourses?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {user.purchasedCourses.map(course => (
                  <CourseCard 
                    key={course._id} 
                    course={course} 
                    progress={courseProgress[course._id]} // Pass progress data
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  You haven't enrolled in any courses yet. Explore our catalog
                  to get started with your learning journey.
                </p>
                <Link href="/courses">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:-translate-y-1 transition-all">
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: EXAM HISTORY --- */}
        {activeTab === "exams" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {loadingResults ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : examResults.length > 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Exam Title</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {examResults.map((result) => {
                                        const percentage = Math.round((result.score / result.totalMarks) * 100);
                                        const isPassed = percentage >= 40; // Assuming 40% pass mark
                                        return (
                                            <tr key={result._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {result.examId?.title || "Unknown Exam"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(result.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-900">{result.score}</span>
                                                    <span className="text-gray-400 text-sm">/{result.totalMarks}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-full text-xs font-bold",
                                                        isPassed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {isPassed ? "Passed" : "Failed"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/exams/solution/${result._id}`}>
                                                        <Button size="sm" variant="outline" className="text-xs h-8">
                                                            View Solution
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            No exams taken yet
                        </h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            You haven't participated in any exams yet. Go to your courses to find available exams.
                        </p>
                        <Link href="/courses">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:-translate-y-1 transition-all">
                                Go to Courses
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
