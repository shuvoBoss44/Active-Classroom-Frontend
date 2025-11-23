"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { user, loading, login, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const pathname = usePathname();

  // Handle scroll effect for glassmorphism intensity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  // Fetch pending enrollments count for admin/teacher
  useEffect(() => {
    if (user && ["admin", "moderator", "teacher"].includes(user.role)) {
      const fetchPendingCount = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/pending-count`,
            { 
              credentials: "include",
              cache: "no-store", // Disable caching
              headers: {
                ...(localStorage.getItem("authToken") ? { "Authorization": `Bearer ${localStorage.getItem("authToken")}` } : {})
              }
            }
          );
          const data = await res.json();
          if (data.success) {
            setPendingCount(data.data.count);
          }
        } catch (error) {
          console.error("Failed to fetch pending count:", error);
        }
      };
      fetchPendingCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Base navigation items
  const baseNavItems = [
    { label: "Home", href: "/", icon: HomeIcon },
    { label: "Courses", href: "/courses", icon: BookOpenIcon },
    { label: "Exams", href: "/exams", icon: ClipboardDocumentListIcon },
    { label: "Notes", href: "/notes", icon: PencilSquareIcon },
  ];

  // Memoized navigation items - optimized with canAccessDashboard helper
  const navItems = useMemo(() => {
    const items = [...baseNavItems];
    
    if (user?.canAccessDashboard) {
      items.push({
        label: "Dashboard",
        href: "/admin",
        icon: ChartBarIcon,
      });
      
      // Add User Acceptance for admin, moderator, and teacher
      if (["admin", "moderator", "teacher"].includes(user?.role)) {
        items.push({
          label: "Acceptance",
          href: "/admin/user-acceptance",
          icon: UserGroupIcon,
          badge: pendingCount > 0 ? pendingCount : null,
        });
      }
    }
    
    return items;
  }, [user?.canAccessDashboard, user?.role, pendingCount]);

  // Role Badge Styling
  const getRoleBadgeStyle = role => {
    switch (role) {
      case "admin":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "teacher":
      case "moderator":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  // Simplified Data Access (useAuth now normalizes data)
  const userName = user?.name || "Student";
  const userRole = user?.role || "student";
  const profileImage = user?.profileImage;

  // Check active route accurately
  const isActive = href => {
    if (href === "/") return pathname === "/";
    // For admin routes, match exactly to prevent conflicts
    if (href.startsWith("/admin")) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled || isMobileMenuOpen
            ? "bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-sm"
            : "bg-white/60 backdrop-blur-lg border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* --- LOGO SECTION --- */}
            <Link
              href="/"
              className="flex items-center gap-3 group relative z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <AcademicCapIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">
                  Active
                </span>
                <span className="text-sm font-semibold text-emerald-600 leading-none tracking-wide">
                  Classroom
                </span>
              </div>
            </Link>

            {/* --- DESKTOP NAVIGATION --- */}
            <nav className="hidden lg:flex items-center bg-gray-100/50 p-1.5 rounded-full border border-gray-200/50 backdrop-blur-sm">
              {navItems.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      active
                        ? "text-emerald-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 bg-white rounded-full shadow-sm border border-gray-200/60"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                        style={{ zIndex: 0 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="flex items-center justify-center min-w-[1.25rem] h-5 bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-full shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* --- AUTH / USER SECTION --- */}
            <div className="hidden lg:flex items-center gap-4 min-w-[180px] justify-end">
              {loading ? (
                // Skeleton Loader
                <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full border border-gray-100 shadow-sm animate-pulse">
                  <div className="w-9 h-9 bg-gray-200 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                    <div className="h-2 w-12 bg-gray-200 rounded" />
                  </div>
                </div>
              ) : user ? (
                // Logged In State with Dropdown
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 bg-white pl-1.5 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="relative">
                      <Image
                        src={profileImage || "/default-avatar.png"}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="rounded-full object-cover ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform"
                        onError={e => (e.target.src = "/default-avatar.png")}
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${
                          userRole === "admin"
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-gray-700 leading-none group-hover:text-emerald-700 transition-colors max-w-[100px] truncate">
                        {userName.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide leading-tight">
                        {userRole}
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-2 space-y-1">
                          <Link
                            href="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                          >
                            <UserCircleIcon className="w-5 h-5" />
                            My Profile
                          </Link>
                          {user.canAccessDashboard && (
                            <Link
                              href="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                            >
                              <ChartBarIcon className="w-5 h-5" />
                              Dashboard
                            </Link>
                          )}
                          <div className="h-px bg-gray-100 my-1" />
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Logged Out State
                <button
                  onClick={login}
                  className="group relative px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-2">
                    <UserCircleIcon className="w-5 h-5" />
                    <span>Login</span>
                  </span>
                </button>
              )}
            </div>

            {/* --- MOBILE PROFILE & MENU TOGGLE --- */}
            <div className="lg:hidden flex items-center gap-3">
              {/* Mobile Profile Icon (Visible on Header) */}
              {user && (
                <Link href="/profile" className="relative">
                  <Image
                    src={profileImage || "/default-avatar.png"}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-white shadow-sm"
                    onError={e => (e.target.src = "/default-avatar.png")}
                  />
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full ${
                      userRole === "admin" ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                </Link>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-7 h-7" />
                ) : (
                  <Bars3Icon className="w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
              {/* Mobile Menu Header: User Info or Title */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={profileImage || "/default-avatar.png"}
                        alt={userName}
                        width={48}
                        height={48}
                        className="rounded-full ring-4 ring-white shadow-md"
                        onError={e => (e.target.src = "/default-avatar.png")}
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                          userRole === "admin"
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-base line-clamp-1">
                        {userName}
                      </span>
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        {userRole}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <AcademicCapIcon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg text-gray-900">
                      Menu
                    </span>
                  </div>
                )}
              </div>

              {/* Scrollable Links Area */}
              <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                {/* Main Nav Items */}
                {navItems.map((item, idx) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-emerald-50 text-emerald-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 font-medium"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${
                          active ? "text-emerald-600" : "text-gray-400"
                        }`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Profile Section Links (If Logged In) */}
                {user && (
                  <>
                    <div className="my-4 border-t border-gray-100" />
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Account
                    </p>
                    
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-all"
                    >
                      <UserCircleIcon className="w-5 h-5 text-gray-400" />
                      My Profile
                    </Link>

                    <div className="my-2" />
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-all text-left"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                )}
              </div>

              {/* Footer (Login Button if not logged in) */}
              {!user && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => {
                      login();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    Login Account
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
