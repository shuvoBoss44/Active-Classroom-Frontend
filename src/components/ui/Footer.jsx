"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  HeartIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import {
  Facebook,
  Youtube,
  Send,
  Instagram,
  Linkedin,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Default Fallback Data (Used while loading or if API fails)
const DEFAULT_INFO = {
  contactPhone: "+880 1700-000000",
  contactEmail: "support@activeclassroom.com",
  platformAddress: "Dhaka, Bangladesh",
  aboutUs:
    "Bangladesh's most trusted online learning platform for SSC & HSC students.",
  founderName: "Shuvo Chakma",
  copyrightText: "© 2025 Active Classroom. All rights reserved.",
  socialLinks: {
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    instagram: "",
    linkedin: "",
  },
};

const Footer = () => {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const currentYear = new Date().getFullYear();

  // Fetch Website Settings from Backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Using the public settings endpoint
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/settings`,
          {
            next: { revalidate: 3600 }, // Cache for 1 hour if using Next.js fetch extensions
          }
        );
        const data = await res.json();
        if (data.success && data.data) {
          // Map backend flat structure to component's expected structure
          setInfo({
            contactPhone: data.data.phone || DEFAULT_INFO.contactPhone,
            contactEmail: data.data.email || DEFAULT_INFO.contactEmail,
            platformAddress: data.data.address || DEFAULT_INFO.platformAddress,
            aboutUs: data.data.aboutUs || DEFAULT_INFO.aboutUs,
            founderName: data.data.founderName || DEFAULT_INFO.founderName,
            copyrightText: data.data.copyrightText || DEFAULT_INFO.copyrightText,
            socialLinks: {
              facebook: data.data.facebook || "",
              youtube: data.data.youtube || "",
              instagram: data.data.instagram || "",
              linkedin: data.data.linkedin || "",
            },
          });
        }
      } catch (error) {
        console.error("Footer: Failed to fetch settings, using defaults.");
      }
    };

    fetchSettings();
  }, []);

  // Navigation Links (Static Structure)
  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "All Courses", href: "/courses" },
    { name: "Free Notes", href: "/notes" },
    { name: "Exams", href: "/exams" },
  ];

  // Legal Links (Static Structure)
  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund" },
  ];

  const handleNewsletterSubmit = e => {
    e.preventDefault();
    toast.success("Newsletter feature coming soon!");
    e.target.reset();
  };

  // Dynamic Social Array based on Backend Data
  const activeSocials = [
    {
      name: "Facebook",
      href: info.socialLinks?.facebook,
      icon: Facebook,
      color: "hover:bg-[#1877F2]/80",
    },
    {
      name: "YouTube",
      href: info.socialLinks?.youtube,
      icon: Youtube,
      color: "hover:bg-[#FF0000]/80",
    },
    {
      name: "Instagram",
      href: info.socialLinks?.instagram,
      icon: Instagram,
      color: "hover:bg-[#E4405F]/80",
    },
    {
      name: "LinkedIn",
      href: info.socialLinks?.linkedin,
      icon: Linkedin,
      color: "hover:bg-[#0077B5]/80",
    },
  ].filter(social => social.href && social.href.length > 5); // Only show if link exists
  return (
    <footer
      className="w-full bg-[#0a0a0a] text-white mt-20 border-t border-emerald-900/40"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 text-center md:text-left">
          {/* 1. Brand Section */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6 flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center space-x-3 sm:space-x-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-emerald-500/30 transition-all group-hover:scale-105">
                <AcademicCapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <h2 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-none">
                  Active Classroom
                </h2>
                <span className="text-xs sm:text-sm font-semibold text-emerald-400 tracking-wider">
                  Ed-Tech Platform
                </span>
              </div>
            </Link>

            {/* Description */}
            <div
              className="text-gray-400 text-sm leading-relaxed max-w-md line-clamp-3"
              dangerouslySetInnerHTML={{
                __html:
                  info.aboutUs?.substring(0, 150) +
                  (info.aboutUs?.length > 150 ? "..." : ""),
              }}
            />
          </div>

          {/* 2. Quick Links */}
          <div className="lg:col-span-2 md:mt-0 flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold text-white mb-4 sm:mb-6 border-b border-gray-800 pb-2 inline-block md:block">
              Explore
            </h3>
            <ul className="space-y-3 sm:space-y-4 w-full flex flex-col items-center md:items-start">
              {navigationLinks.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-3 text-sm group justify-center md:justify-start"
                  >
                    <span className="w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Section */}
          <div className="lg:col-span-3 flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold text-white mb-4 sm:mb-6 border-b border-gray-800 pb-2 inline-block md:block">
              Get in Touch
            </h3>

            <div className="space-y-4 sm:space-y-5 w-full">
              {/* Phone */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
                <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                  <PhoneIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-gray-500 text-xs uppercase tracking-wider">
                    Call Us
                  </p>
                  <a
                    href={`tel:${info.contactPhone}`}
                    className="font-semibold text-white hover:text-emerald-400 transition-colors text-sm"
                  >
                    {info.contactPhone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
                <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                  <EnvelopeIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-gray-500 text-xs uppercase tracking-wider">
                    Email Us
                  </p>
                  <a
                    href={`mailto:${info.contactEmail}`}
                    className="font-semibold text-white hover:text-emerald-400 transition-colors text-sm break-all"
                  >
                    {info.contactEmail}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
                <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                  <MapPinIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-gray-500 text-xs uppercase tracking-wider">
                    Visit Us
                  </p>
                  <span className="font-semibold text-white text-sm">
                    {info.platformAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Social + Newsletter */}
          <div className="lg:col-span-3 md:col-span-2 flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold text-white mb-4 sm:mb-6 border-b border-gray-800 pb-2 inline-block md:block">
              Stay Updated
            </h3>

            {/* Social Icons */}
            <div className="flex gap-3 mb-6 sm:mb-8 justify-center md:justify-start">
              {activeSocials.map(social => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 sm:w-11 sm:h-11 bg-gray-800 rounded-xl flex items-center justify-center hover:scale-105 transition-all duration-300 border border-gray-700 ${social.color}`}
                    aria-label={`Visit our ${social.name} page`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                );
              })}
            </div>

            {/* Newsletter */}
            <div className="bg-gray-800/60 rounded-xl p-4 sm:p-5 border border-gray-700/50 shadow-2xl shadow-black/50 w-full">
              <h4 className="font-bold text-white mb-2 text-base text-center md:text-left">
                Get Exclusive Notes
              </h4>
              <p className="text-gray-400 text-sm mb-4 text-center md:text-left">
                Subscribe for free study materials & offers.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex relative w-full">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    className="flex-1 w-full pl-4 pr-12 sm:pr-14 py-2.5 sm:py-3 rounded-xl bg-gray-900 border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-white text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/70 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
            {/* Legal Links */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center order-1 md:order-1">
              {legalLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-500 hover:text-emerald-400 transition-colors text-xs font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-gray-500 text-xs order-2 md:order-2">
              {info.copyrightText}
            </p>

            {/* Made with */}
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1 order-3">
              Made By{" "}
              <span className="text-emerald-400 font-semibold">{info.founderName}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
