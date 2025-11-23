// app/admin/users/[userId]/page.jsx
"use client";

import { useEffect, useState, use } from "react";
// Removed useParams import, as params are received via props
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/Loader";
import {
  Crown,
  User,
  Mail,
  Smartphone,
  School,
  Calendar,
  Layers,
  Link2,
  Lock,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils"; // Assuming cn utility

// Helper component for displaying data
const InfoBlock = ({ icon: Icon, title, value }) => (
  <div className="flex items-start space-x-4 p-4 border-b border-gray-100 last:border-b-0">
    <Icon className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-xs font-semibold uppercase text-gray-500">{title}</p>
      <p className="text-base font-medium text-gray-800 break-words">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </p>
    </div>
  </div>
);

// FIX: UserProfile component must receive params as a prop
export default function UserProfile({ params }) {
  const router = useRouter();
  // Unwrap params using React.use()
  const { userID: userId } = use(params);
  
  const { user: currentUser, loading: authLoading } = useAuth();

  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to format date
  const formatDate = dateString => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // --- Data Fetching and Auth Protection ---
  useEffect(() => {
    // 1. Auth check: Block access if user is not loaded OR if user is NEITHER admin NOR moderator
    if (
      !authLoading &&
      (!currentUser ||
        !(currentUser.role === "admin" || currentUser.role === "moderator"))
    ) {
      router.replace("/");
      return;
    }

    // 2. Fetch User Data: Proceed only if current user has the required role
    if (currentUser?.role === "admin" || currentUser?.role === "moderator") {
      const fetchUser = async () => {
        setLoading(true);
        setError(null);
        try {
          // This endpoint is expected to fetch by Mongoose _id (mongooseId)
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
            {
              credentials: "include",
            }
          );
          const data = await res.json();

          if (res.ok && data.data?.user) {
            setTargetUser(data.data.user);
          } else {
            setError(data.message || "User not found or fetch failed.");
          }
        } catch (err) {
          console.error("Fetch error:", err);
          setError("An error occurred while fetching user data.");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [currentUser, authLoading, router, userId]);

  // --- Loading States ---
  if (authLoading || loading) {
    return <Loader text={`Loading User Profile for ${userId}...`} />;
  }

  if (error || !targetUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-xl shadow-xl border border-red-100 text-center">
          <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Access Denied or User Not Found
          </h2>
          <p className="mt-2 text-red-600">
            {error || "The requested user profile could not be loaded."}
          </p>
          <Button
            onClick={() => router.push("/admin/users")}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to User List
          </Button>
        </div>
      </div>
    );
  }

  // --- Role Badge for Header ---
  const RoleBadge = ({ role }) => {
    const roleStyles = {
      admin: "bg-red-500",
      teacher: "bg-emerald-600",
      moderator: "bg-blue-500",
      student: "bg-gray-600",
    };
    return (
      <span
        className={cn(
          "px-4 py-1.5 rounded-full text-lg font-bold text-white shadow-lg",
          roleStyles[role] || roleStyles.student
        )}
      >
        {role.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button
            onClick={() => router.push("/admin/users")}
            variant="ghost"
            className="text-gray-600 hover:text-emerald-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to User List
          </Button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-5 w-5 text-emerald-600" />
            User Profile Details
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
          <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="relative flex-shrink-0">
              <Image
                src={targetUser.profileImage || "/default-avatar.png"}
                alt={targetUser.name}
                width={150}
                height={150}
                className="w-36 h-36 rounded-full border-4 border-emerald-500 shadow-lg object-cover"
              />
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                {targetUser.name}
              </h2>
              <div className="mb-4">
                <RoleBadge role={targetUser.role} />
              </div>
              <p className="text-xl text-gray-600 font-medium">
                {targetUser.email}
              </p>
              <p className="text-md text-gray-500 mt-1">
                Joined: {formatDate(targetUser.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Personal & Contact Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-fit">
            <h3 className="text-lg font-bold p-5 border-b bg-gray-50 text-gray-700 rounded-t-xl">
              Personal & Contact Information
            </h3>
            <div className="divide-y divide-gray-100">
              <InfoBlock
                icon={User}
                title="Full Name"
                value={targetUser.name}
              />
              <InfoBlock
                icon={Mail}
                title="Email Address"
                value={targetUser.email}
              />
              <InfoBlock
                icon={Smartphone}
                title="Personal Phone"
                value={targetUser.phone}
              />
              <InfoBlock
                icon={Smartphone}
                title="Guardian Phone"
                value={targetUser.guardianPhone}
              />
              {targetUser.facebookId && (
                <InfoBlock
                  icon={Link2}
                  title="Facebook ID"
                  value={targetUser.facebookId}
                />
              )}
            </div>
          </div>

          {/* Column 2: Academic & System Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-fit">
            <h3 className="text-lg font-bold p-5 border-b bg-gray-50 text-gray-700 rounded-t-xl">
              Academic & System Details
            </h3>
            <div className="divide-y divide-gray-100">
              <InfoBlock
                icon={School}
                title="School Name"
                value={targetUser.school}
              />
              <InfoBlock
                icon={School}
                title="College Name"
                value={targetUser.college}
              />
              <InfoBlock
                icon={Calendar}
                title="Session/Batch"
                value={targetUser.session}
              />
              <InfoBlock
                icon={Lock}
                title="Firebase UID"
                value={targetUser.userId}
              />
              <InfoBlock
                icon={Calendar}
                title="Last Updated"
                value={formatDate(targetUser.updatedAt)}
              />
            </div>
          </div>

          {/* Column 3: Activity & Courses */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-fit">
            <h3 className="text-lg font-bold p-5 border-b bg-gray-50 text-gray-700 rounded-t-xl">
              Courses & Activity
            </h3>
            <div className="divide-y divide-gray-100">
              <div className="p-4">
                <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
                  Purchased Courses
                </p>
                {/* Ensure purchasedCourses is an array before mapping */}
                {Array.isArray(targetUser.purchasedCourses) &&
                targetUser.purchasedCourses.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {targetUser.purchasedCourses.map((course, index) => (
                      <li key={course?._id || index} className="flex items-center">
                        <Layers className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                        {course?.title || "Unknown Course"} ({course?.classType || "N/A"})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base text-gray-400 italic">
                    No courses purchased yet.
                  </p>
                )}
              </div>

              {/* Placeholder for future activity logs */}
              <div className="p-4">
                <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
                  Recent Activity
                </p>
                <p className="text-base text-gray-400 italic">
                  Activity logs integration coming soon...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
