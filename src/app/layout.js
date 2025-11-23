import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import NextTopLoader from "nextjs-toploader";
import { Modal } from "@/components/ui/Modal";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Active Classroom | Modern Ed-Tech Platform",
    template: "%s | Active Classroom",
  },
  description:
    "Bangladesh's most trusted online learning platform for SSC & HSC students. Join thousands of students learning with our premium courses, exams, and notes.",
  keywords: [
    "Active Classroom",
    "SSC",
    "HSC",
    "Online Education",
    "Bangladesh Education",
    "E-learning",
    "Exam Preparation",
    "Model Tests",
  ],
  authors: [{ name: "Shuvo Chakma" }],
  creator: "Shuvo Chakma",
  publisher: "Active Classroom",
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "https://active-classroom-frontend.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Active Classroom | Modern Ed-Tech Platform",
    description:
      "Unlock your potential with Active Classroom. Expert-led courses, comprehensive notes, and real-time exams for SSC & HSC students.",
    url: "https://active-classroom-frontend.vercel.app",
    siteName: "Active Classroom",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 600,
        alt: "Active Classroom Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Active Classroom",
    description: "Bangladesh's premier online learning platform.",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-20`}
      >
        <NextTopLoader
          color="#10b981"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #10b981,0 0 5px #10b981"
        />
        <Navbar />
        {children}
        <Modal />
        <Toaster position="top-center" reverseOrder={false} />
        <Footer />
      </body>
    </html>
  );
}
