"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Carousel from "@/components/home/Carousel";
import PopularCourses from "@/components/home/PopularCourses";
import Faculty from "@/components/home/Faculty";
import AboutUs from "@/components/home/AboutUs";
import Contact from "@/components/home/Contact";
import StatsCounter from "@/components/home/StatsCounter";

// --- FALLBACK DATA (Kept as is) ---
const DEFAULT_WEBSITE = {
  aboutUs: `<h2>Empowering the Future of Bangladesh</h2><p>Active Classroom is more than just a website; it's a movement. We are dedicated to democratizing education for every student in every corner of the country.</p>`,
  platformEmail: "hello@activeclassroom.com",
  contactPhone: "+880 1700-123456",
  platformAddress: "Level 4, Khan Tower, Dhanmondi 27, Dhaka",
  socialLinks: {
    facebook: "https://facebook.com",
    youtube: "https://youtube.com"
  }
};

const DEFAULT_COURSES = [
  {
    _id: "fallback-1",
    title: "HSC Physics 2025: Zero to Hero",
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1000",
    overview: "Complete syllabus coverage with animated visualizations.",
    classType: "HSC",
    price: 5000,
    discountedPrice: 3500,
    studentsEnrolled: 1540,
    examsNumber: 12,
    instructors: [{ _id: "inst-1", name: "Dr. Ali", role: "Senior Lecturer", profileImage: "/default-avatar-ali.png" }]
  },
  {
    _id: "fallback-2",
    title: "SSC General Math Crash Course",
    thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=1000",
    overview: "Solve 500+ board questions in 3 months.",
    classType: "SSC",
    price: 3000,
    discountedPrice: 1500,
    studentsEnrolled: 2100,
    examsNumber: 8,
    instructors: [{ _id: "inst-2", name: "Fatima Ma'am", role: "Math Expert", profileImage: "/default-avatar-fatima.png" }]
  }
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();

  const [websiteInfo, setWebsiteInfo] = useState({
    aboutUs: DEFAULT_WEBSITE.aboutUs,
    platformEmail: DEFAULT_WEBSITE.platformEmail,
    platformPhone: DEFAULT_WEBSITE.contactPhone,
    platformAddress: DEFAULT_WEBSITE.platformAddress,
    socialLinks: DEFAULT_WEBSITE.socialLinks,
  });
  const [popularCourses, setPopularCourses] = useState(DEFAULT_COURSES);
  const [allCourses, setAllCourses] = useState(DEFAULT_COURSES);
  const [featuredFaculty, setFeaturedFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Statistics derived from courses
  const totalStudents = allCourses.reduce((acc, course) => acc + (course.studentsEnrolled || 0), 0);
  const totalExams = allCourses.reduce((acc, course) => acc + (course.examsNumber || 0), 0);
  const totalCourses = allCourses.length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [settingsRes, coursesRes, facultyRes] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/teacher`).then(r => r.json()),
        ]);

        // Handle settings
        if (settingsRes.status === 'fulfilled' && settingsRes.value?.success) {
          const rawWebsite = settingsRes.value.data || {};
          setWebsiteInfo({
            aboutUs: rawWebsite.aboutUs || DEFAULT_WEBSITE.aboutUs,
            platformEmail: rawWebsite.email || DEFAULT_WEBSITE.platformEmail,
            platformPhone: rawWebsite.phone || DEFAULT_WEBSITE.contactPhone,
            platformAddress: rawWebsite.address || DEFAULT_WEBSITE.platformAddress,
            socialLinks: {
              facebook: rawWebsite.facebook || DEFAULT_WEBSITE.socialLinks.facebook,
              youtube: rawWebsite.youtube || DEFAULT_WEBSITE.socialLinks.youtube,
              instagram: rawWebsite.instagram || "",
              twitter: rawWebsite.twitter || "",
            },
          });
        }

        // Handle courses
        if (coursesRes.status === 'fulfilled' && coursesRes.value?.success) {
          const courses = coursesRes.value.data?.courses || coursesRes.value.courses || [];
          if (Array.isArray(courses) && courses.length > 0) {
            setPopularCourses(courses);
            setAllCourses(courses);
          }
        }

        // Handle faculty
        if (facultyRes.status === 'fulfilled' && facultyRes.value?.success) {
          const faculty = facultyRes.value.data?.teachers || [];
          setFeaturedFaculty(faculty);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar socialLinks={websiteInfo.socialLinks} />

      {/* Carousel with top 5 courses */}
      <Carousel courses={popularCourses.slice(0, 5)} />

      <StatsCounter
        totalStudents={totalStudents}
        totalCourses={totalCourses}
        totalExams={totalExams}
      />

      {/* Popular Courses */}
      <PopularCourses courses={popularCourses} />

      {/* Faculty Section */}
      {featuredFaculty.length > 0 ? (
        <Faculty members={featuredFaculty} />
      ) : (
        <Faculty />
      )}

      <AboutUs content={websiteInfo.aboutUs} />

      <Contact
        email={websiteInfo.platformEmail}
        phone={websiteInfo.platformPhone}
        address={websiteInfo.platformAddress}
        social={websiteInfo.socialLinks}
      />

    </main>
  );
}