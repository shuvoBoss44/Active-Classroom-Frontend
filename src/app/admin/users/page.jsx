// app/admin/users/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Crown,
  ChevronDown,
  ChevronUp,
  Trash2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

// --- Role Management Constants & Helper Components ---

const ROLES = ["student", "moderator", "teacher", "admin"];

// Defines the priority order for sorting (lower number means higher priority/comes first)
const ROLE_ORDER = {
  admin: 1,
  moderator: 2,
  teacher: 3,
  student: 4,
};

const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: "bg-red-100 text-red-700 ring-red-600/20",
    teacher: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    moderator: "bg-blue-100 text-blue-700 ring-blue-600/20",
    student: "bg-gray-100 text-gray-700 ring-gray-600/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        roleStyles[role] || roleStyles.student
      )}
    >
      {role.toUpperCase()}
    </span>
  );
};

// --- Main Component ---

export default function ManageUsers() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetching, setFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sorting state (default to sorting by role priority)
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  // --- 1. Admin Protection & Data Fetch ---
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      const fetchUsers = async () => {
        setFetching(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
            { credentials: "include" }
          );
          const data = await res.json();
          if (data.data?.users) {
            setUsers(data.data.users);
          } else {
            console.error("Failed to load users:", data);
          }
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setFetching(false);
        }
      };
      fetchUsers();
    }
  }, [user]);

  // --- 2. Action Handlers (Role Change/Delete) ---

  const handleRoleChange = async (targetFirebaseId, newRole) => {
    if (isSubmitting) return;

    if (
      !confirm(
        `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`
      )
    ) {
      // Revert the UI state if canceled
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.userId === targetFirebaseId ? { ...u, role: u.role } : u
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/role`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          // FIX: Pass the correct userId (Firebase UID)
          body: JSON.stringify({ userId: targetFirebaseId, role: newRole }),
        }
      );
      const result = await res.json();

      if (res.ok) {
        setUsers(
          // Update local state using userId for comparison
          users.map(u =>
            u.userId === targetFirebaseId ? { ...u, role: newRole } : u
          )
        );
        toast.success(`User role updated to ${newRole.toUpperCase()}`);
      } else {
        // Failure: Revert the UI state
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.userId === targetFirebaseId
              ? {
                  ...u,
                  role: prevUsers.find(p => p.userId === targetFirebaseId).role,
                }
              : u
          )
        );
        throw new Error(result.message || "Failed to update role.");
      }
    } catch (err) {
      console.error("Role Change Error:", err);
      toast.error(`Failed to change user role: ${err.message || "Check console."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async targetFirebaseId => {
    if (!confirm("Delete this user permanently? This action cannot be undone."))
      return;

    setIsSubmitting(true);
    try {
      // FIX: Use the correct userId (Firebase UID) in the URL parameter
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${targetFirebaseId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        setUsers(users.filter(u => u.userId !== targetFirebaseId));
        toast.success("User deleted successfully");
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(`Failed to delete user: ${err.message || "Check console."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. Sorting Logic ---

  const requestSort = key => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = key => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // --- 4. Filtering and Sorting Combined (NEW PRIORITY SORTING) ---

  const sortedAndFilteredUsers = useMemo(() => {
    let tempUsers = [...users];

    // 1. Filtering
    const filtered = tempUsers.filter(
      u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.college?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sorting
    filtered.sort((a, b) => {
      // A. Primary Sort: Role Priority (Admin, Moderator, Teacher, Student)
      const orderA = ROLE_ORDER[a.role] || 5;
      const orderB = ROLE_ORDER[b.role] || 5;

      if (orderA !== orderB) {
        // Lower number in ROLE_ORDER means higher priority, so return difference
        return orderA - orderB;
      }

      // B. Secondary Sort: Fallback to sortConfig (e.g., Name, Email)
      if (sortConfig !== null) {
        const aKey =
          sortConfig.key === "institution" ? a.school : a[sortConfig.key];
        const bKey =
          sortConfig.key === "institution" ? b.school : b[sortConfig.key];

        const aValue = aKey?.toLowerCase() || "";
        const bValue = bKey?.toLowerCase() || "";

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
      }
      return 0;
    });

    return filtered;
  }, [users, searchTerm, sortConfig]);

  // --- 5. Loading/Auth Check ---

  if (loading || fetching) {
    return <Loader text="Loading User Management Panel..." />;
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header - Minimal & Professional */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Crown className="h-6 w-6 text-emerald-600" />
            User Management Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage roles, access, and accounts for all {users.length} users.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-1/2 lg:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search across ${users.length} users...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User Count Stats */}
          <div className="text-sm font-medium text-gray-700">
            Showing{" "}
            <span className="font-bold text-emerald-600">
              {sortedAndFilteredUsers.length}
            </span>{" "}
            results
            {searchTerm && (
              <span>
                {" "}
                for "<span className="italic">{searchTerm}</span>"
              </span>
            )}
          </div>
        </div>

        {/* User Data Table (Responsive Wrapper) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Table Headers with Sorting */}
                {["Name", "Email", "Institution"].map(header => {
                  const key = header.toLowerCase().replace(/ /g, "");
                  return (
                    <th
                      key={key}
                      onClick={() => requestSort(key)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center">
                        {header}
                        {getSortIcon(key)}
                      </div>
                    </th>
                  );
                })}
                <th
                  onClick={() => requestSort("role")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap min-w-[150px]"
                >
                  <div className="flex items-center">
                    Role
                    {getSortIcon("role")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Delete
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {sortedAndFilteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-sm text-gray-500 italic"
                  >
                    No users found matching your search criteria.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredUsers.map(u => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Name (With Icons and Clickable Link) */}
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:text-emerald-600 transition-colors"
                        // Add onClick handler to navigate to the profile page using the MongoDB _id
                        onClick={() => router.push(`/admin/users/${u._id}`)}
                        title={`View profile for ${u.name}`}
                      >
                        {u.role === "admin" && (
                          <Crown
                            className="h-5 w-5 text-red-500 flex-shrink-0"
                            title="System Admin"
                          />
                        )}
                        {u.role === "moderator" && (
                          <Shield
                            className="h-4 w-4 text-blue-500 flex-shrink-0"
                            title="Moderator"
                          />
                        )}
                        <span className="font-semibold underline-offset-4 hover:underline">
                          {u.name}
                        </span>
                        {/* Indicate self for the current admin */}
                        {u.userId === user.userId && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {u.email}
                    </td>

                    {/* Institution */}
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {u.school || u.college || "N/A"}
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-6 py-3 whitespace-nowrap text-sm">
                      {/* Only display badge for other admins, allow dropdown for self-admin and others */}
                      {u.role === "admin" && u.userId !== user.userId ? (
                        <RoleBadge role="admin" />
                      ) : (
                        <select
                          value={u.role}
                          // Pass u.userId (Firebase UID) to the handler
                          onChange={e =>
                            handleRoleChange(u.userId, e.target.value)
                          }
                          disabled={u.userId === user.userId || isSubmitting} // Disable if changing self or submitting
                          className={cn(
                            "block w-full text-sm py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors",
                            u.userId === user.userId &&
                              "bg-gray-100 text-gray-500 cursor-not-allowed",
                            isSubmitting && "opacity-70"
                          )}
                        >
                          {ROLES.map(roleOption => (
                            <option key={roleOption} value={roleOption}>
                              {roleOption.charAt(0).toUpperCase() +
                                roleOption.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Delete Button */}
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="destructive"
                        // Pass u.userId (Firebase UID) to the handler
                        onClick={() => deleteUser(u.userId)}
                        size="icon"
                        className="h-8 w-8 bg-red-500 hover:bg-red-600 disabled:opacity-50"
                        disabled={
                          u.role === "admin" ||
                          u.userId === user.userId ||
                          isSubmitting
                        } // Prevent deleting admins or self
                        title={
                          u.role === "admin"
                            ? "Cannot delete admin"
                            : "Delete User"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
