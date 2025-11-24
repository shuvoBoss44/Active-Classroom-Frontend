// components/note/NoteViewer.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
} from "lucide-react";

export default function NoteViewer({ note, onClose, initialProgress = 0 }) {
  const [scale, setScale] = useState(1);
  const [page, setPage] = useState(1); // Not used for Drive embeds, but kept for future local PDF viewer compatibility
  const [progress, setProgress] = useState(initialProgress);

  // Extract Google Drive file ID
  const getFileId = url => {
    // This regex covers /d/FILE_ID/view and /file/d/FILE_ID/edit
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const fileId = getFileId(note.fileUrl);
  // Using 'embed' for a cleaner viewer experience
  const embedUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/embed`
    : null;

  // Handle scroll event for progress tracking
  // Note: Due to cross-origin limitations with iframe content, this scroll tracking logic
  // might not function for Google Drive embeds unless the user scrolls the browser window
  // (if the iframe is sized to 100% height) or if the iframe is locally hosted/same-origin.
  // For production, a dedicated PDF viewer library (like react-pdf) is recommended
  // for reliable progress tracking inside the document.
  const handleScroll = useCallback(() => {
    // This logic assumes the iframe itself is what we need to scroll.
    // However, external iframes often block script access to their DOM.
    // For this example, we'll keep the logic but rely on a robust PDF library later.
    const element = document.getElementById("note-iframe");
    if (element) {
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const scrollTop = element.scrollTop;
      const newProgress =
        scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(Math.min(100, newProgress));
      // Save progress to backend/local storage here
    }
  }, []);

  useEffect(() => {
    // Attempt to attach scroll listener to the iframe's content window
    const iframe = document.getElementById("note-iframe");
    if (iframe) {
      // Attempt to get content window, though this often fails for cross-origin iframes
      // if (iframe.contentWindow) {
      //   iframe.contentWindow.addEventListener("scroll", handleScroll);
      // }
      // For the sake of demonstration and local testing:
      iframe.addEventListener("scroll", handleScroll);
    }
    return () => iframe?.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const roundedProgress = Math.round(progress);

  if (!embedUrl) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
          <FileText className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
            Note Unavailable
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            The resource link is invalid or content is being updated.
          </p>
          <button
            onClick={onClose}
            className="px-12 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xl font-bold transition-all shadow-lg"
          >
            Close Viewer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      {/* Header (Controls and Title) */}
      <div className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white p-3 sm:p-4 md:p-6 flex items-center justify-between shadow-2xl z-10 gap-2">
        {/* Left Side: Close and Title */}
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <button
            onClick={onClose}
            className="p-3 md:p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all shadow-md group"
            aria-label="Close Viewer"
          >
            <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold line-clamp-1">
              {note.title}
            </h1>
            <p className="text-indigo-200 text-sm md:text-base">
              Resource by: {note.createdBy?.name || "Active Classroom"}
            </p>
          </div>
        </div>

        {/* Right Side: Zoom and Download */}
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-lg font-semibold hidden sm:block">Zoom:</span>

          <button
            className="p-3 md:p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all shadow-md disabled:opacity-50"
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            disabled={scale <= 0.5}
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>

          <span className="text-lg font-bold min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            className="p-3 md:p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all shadow-md disabled:opacity-50"
            onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
            disabled={scale >= 2.0}
            aria-label="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          <a
            href={note.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 md:p-4 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg ml-4"
            aria-label="Download Note PDF"
          >
            <Download className="h-5 w-5" />
            <span className="hidden md:block font-semibold">Download</span>
          </a>
        </div>
      </div>

      {/* Viewer Frame */}
      <div className="flex-1 overflow-auto bg-gray-900">
        <iframe
          id="note-iframe"
          // Key for refresh (if needed for progress tracking reset)
          key={embedUrl}
          src={embedUrl}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
          allowFullScreen
          // Add sandbox restrictions for security if source isn't fully trusted
          sandbox="allow-scripts allow-popups allow-same-origin allow-forms"
          title={`Document Viewer for ${note.title}`}
        />
      </div>

      {/* Progress Bar Footer */}
      <div className="bg-gray-800 p-4 shadow-inner">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between text-white mb-2">
            <span className="text-base md:text-xl font-bold">
              Your Reading Progress
            </span>
            <span className="text-xl md:text-2xl font-extrabold">
              {roundedProgress}%
            </span>
          </div>
          <div className="h-4 md:h-6 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-700"
              style={{ width: `${roundedProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
