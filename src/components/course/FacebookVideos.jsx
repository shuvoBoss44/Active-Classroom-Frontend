"use client";

import { PlayCircle, Lock } from "lucide-react";
import Link from "next/link";

export default function FacebookVideos({ videos }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <PlayCircle className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Exclusive Group Videos
          </h2>
          <p className="text-sm text-gray-500">
            Access recorded lectures and sessions from our private community.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {videos.map((video, index) => (
          <Link
            key={index}
            href={video.url}
            target="_blank"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {index + 1}
              </div>
              <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                {video.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              Watch Now
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
