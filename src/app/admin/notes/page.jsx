// app/admin/notes/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, FileText, Link as LinkIcon, Upload, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function AdminNotes() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protect Route — Only Teacher/Moderator/Admin
  useEffect(() => {
    if (
      !loading &&
      (!user || !["teacher", "moderator", "admin"].includes(user.role))
    ) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const uploadNote = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !fileUrl.trim()) {
      toast.error("Title and Google Drive link are required!");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), fileUrl: fileUrl.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Note Uploaded Successfully!");
        setTitle("");
        setFileUrl("");
      } else {
        toast.error(data.message || "Failed to upload note");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user || !["teacher", "moderator", "admin"].includes(user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 -ml-2">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <h1 className="text-lg font-bold text-gray-900">Upload Central Note</h1>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {user.role.toUpperCase()}
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              New Note Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Share important study materials with all students.
            </p>
          </div>

          <form onSubmit={uploadNote} className="p-6 sm:p-8 space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Note Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. HSC Physics Chapter 5 Formulas"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none placeholder:text-gray-400"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Google Drive Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="url"
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none placeholder:text-gray-400 font-mono text-sm"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  required
                />
              </div>
              
              {/* Helper Text */}
              <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Ensure the file permission is set to <strong>"Anyone with the link"</strong> can <strong>View</strong> before sharing.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Note
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
