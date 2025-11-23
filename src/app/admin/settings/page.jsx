"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Youtube,
  Instagram,
  Linkedin,
  Settings as SettingsIcon,
  FileText,
  User,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Reusable Input Component for Consistency ---
const SettingInput = ({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  placeholder,
  textarea = false,
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-3 text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={4}
          className={cn(
            "w-full p-3 rounded-lg border text-sm transition-all outline-none resize-none",
            Icon ? "pl-10" : "",
            "bg-white border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          )}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full p-2.5 rounded-lg border text-sm transition-all outline-none",
            Icon ? "pl-10" : "",
            "bg-white border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          )}
          placeholder={placeholder}
        />
      )}
    </div>
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Matches the FLAT schema expected by backend
  const [formData, setFormData] = useState({
    siteName: "",
    tagline: "",
    logo: "",
    aboutUs: "",
    email: "",
    phone: "",
    address: "",
    facebook: "",
    youtube: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    founderName: "",
    founderTitle: "",
    metaDescription: "",
    metaKeywords: "",
    privacyPolicy: "",
    termsOfService: "",
    refundPolicy: "",
    footerText: "",
    copyrightText: "",
    totalStudents: 0,
    totalCourses: 0,
  });

  // --- 1. Auth Check ---
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // --- 2. Fetch Settings ---
  useEffect(() => {
    if (user?.role === "admin") {
      const fetchSettings = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/settings`
          );
          const data = await res.json();

          if (data.success && data.data) {
            // Direct merge since structures match
            setFormData(prev => ({ ...prev, ...data.data }));
          }
        } catch (err) {
          console.error("Failed to load settings:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchSettings();
    }
  }, [user]);

  // --- 3. Handlers ---
  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();

      if (result.success) {
        alert("Settings updated successfully!");
      } else {
        alert(result.message || "Failed to update settings");
      }
    } catch (err) {
      alert("Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Platform Settings
                </h1>
                <p className="text-sm text-gray-500">
                  Manage global website content and configurations.
                </p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Section 1: Platform Branding */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-gray-400" /> Platform Branding
          </h2>
          <div className="grid gap-6">
            <SettingInput
              label="Site Name"
              value={formData.siteName}
              onChange={e => handleChange("siteName", e.target.value)}
              placeholder="Active Classroom"
            />
            <SettingInput
              label="Tagline"
              value={formData.tagline}
              onChange={e => handleChange("tagline", e.target.value)}
              placeholder="Bangladesh's Leading Ed-Tech Platform"
            />
            <SettingInput
              label="Logo URL"
              value={formData.logo}
              onChange={e => handleChange("logo", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </section>

        {/* Section 2: About & Content */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" /> General Content
          </h2>
          <div className="grid gap-6">
            <SettingInput
              label="'About Us' Content"
              value={formData.aboutUs}
              onChange={e => handleChange("aboutUs", e.target.value)}
              placeholder="Enter the text displayed on the homepage about section..."
              textarea
            />
          </div>
        </section>

        {/* Section 3: Contact Information */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-400" /> Contact Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingInput
              label="Support Email"
              icon={Mail}
              type="email"
              value={formData.email}
              onChange={e => handleChange("email", e.target.value)}
              placeholder="support@activeclassroom.com"
            />
            <SettingInput
              label="Support Phone"
              icon={Phone}
              value={formData.phone}
              onChange={e => handleChange("phone", e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
            />
            <div className="md:col-span-2">
              <SettingInput
                label="Physical Address"
                icon={MapPin}
                value={formData.address}
                onChange={e => handleChange("address", e.target.value)}
                placeholder="House X, Road Y, Dhaka..."
              />
            </div>
          </div>
        </section>

        {/* Section 4: Social Media Links */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-400" /> Social Connections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingInput
              label="Facebook Page URL"
              icon={Facebook}
              value={formData.facebook}
              onChange={e => handleChange("facebook", e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
            <SettingInput
              label="YouTube Channel URL"
              icon={Youtube}
              value={formData.youtube}
              onChange={e => handleChange("youtube", e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
            />
            <SettingInput
              label="Instagram Profile URL"
              icon={Instagram}
              value={formData.instagram}
              onChange={e => handleChange("instagram", e.target.value)}
              placeholder="https://instagram.com/yourprofile"
            />
            <SettingInput
              label="LinkedIn Profile URL"
              icon={Linkedin}
              value={formData.linkedin}
              onChange={e => handleChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>
        </section>

        {/* Section 5: Founder Information */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" /> Founder & Credits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingInput
              label="Founder Name"
              icon={User}
              value={formData.founderName}
              onChange={e => handleChange("founderName", e.target.value)}
              placeholder="Shuvo Chakma"
            />
            <SettingInput
              label="Founder Title"
              value={formData.founderTitle}
              onChange={e => handleChange("founderTitle", e.target.value)}
              placeholder="Founder & CEO"
            />
          </div>
        </section>

        {/* Section 6: Footer Customization */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" /> Footer Settings
          </h2>
          <div className="grid gap-6">
            <SettingInput
              label="Copyright Text"
              value={formData.copyrightText}
              onChange={e => handleChange("copyrightText", e.target.value)}
              placeholder="© 2025 Active Classroom. All rights reserved."
            />
          </div>
        </section>
      </main>
    </div>
  );
}
