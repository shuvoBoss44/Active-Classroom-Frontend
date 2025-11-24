// app/notes/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  Search,
  FileText,
  Grid,
  List as ListIcon,
  Filter,
  Download,
  ExternalLink,
  Calendar,
  Hash,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// --- 1. LIST VIEW COMPONENT (For high density data) ---
const NoteRow = ({ note }) => (
  <div
    onClick={() => window.open(note.fileUrl, "_blank")}
    className="group flex items-center gap-4 p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer last:border-0"
  >
    {/* Icon */}
    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
      <FileText className="h-5 w-5" />
    </div>

    {/* Title & Subject */}
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700">
        {note.title}
      </h3>
      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
        <Hash className="h-3 w-3" /> {note.subject || "General"}
      </p>
    </div>

    {/* Date (Hidden on mobile) */}
    <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 w-32">
      <Calendar className="h-3 w-3" />
      {new Date(note.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
    </div>

    {/* Author (Hidden on tablet) */}
    <div className="hidden md:block text-xs text-gray-500 w-32 truncate">
      By {note.createdBy?.name || "Admin"}
    </div>

    {/* Action */}
    <Button
      variant="ghost"
      size="sm"
      className="text-gray-400 hover:text-emerald-600"
    >
      <ExternalLink className="h-4 w-4" />
    </Button>
  </div>
);

// --- 2. GRID VIEW COMPONENT (Visual focused) ---
const NoteCard = ({ note }) => (
  <div
    onClick={() => window.open(note.fileUrl, "_blank")}
    className="group bg-white rounded-xl border border-gray-200 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
  >
    {/* Card Header / Preview Area */}
    <div className="h-32 bg-gray-50 border-b border-gray-100 flex items-center justify-center group-hover:bg-emerald-50/30 transition-colors">
      <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
        <FileText className="h-7 w-7 text-emerald-600" />
      </div>
    </div>

    {/* Card Body */}
    <div className="p-5 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {note.subject || "Resource"}
        </span>
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
        {note.title}
      </h3>

      <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-1 text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Open File <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  </div>
);

export default function NotesPage() {
  const { loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetching, setFetching] = useState(true);

  // View State: 'grid' or 'list'
  const [viewMode, setViewMode] = useState("grid");
  // Filter State: 'All', 'Physics', 'Math', etc. (Mocking categories for now)
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchNotes = async () => {
      setFetching(true);
      try {
        const url = searchTerm
          ? `${
              process.env.NEXT_PUBLIC_API_URL
            }/api/notes?search=${encodeURIComponent(searchTerm)}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/notes`;

        const res = await fetch(url);
        const data = await res.json();
        const fetchedNotes = data.data?.notes || data.notes || [];
        setNotes(fetchedNotes);
        setFilteredNotes(fetchedNotes);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    const timer = setTimeout(fetchNotes, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Client-side Tab Filtering
  useEffect(() => {
    if (activeTab === "All") {
      setFilteredNotes(notes);
    } else {
      // Simple check if subject includes the tab name
      setFilteredNotes(notes.filter(n => n.subject?.includes(activeTab)));
    }
  }, [activeTab, notes]);

  // --- RENDER HELPERS ---
  const tabs = ["All", "Physics", "Math", "Chemistry", "Biology"];

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500 font-medium">
            Syncing Library...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 1. Minimalist Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              [cite_start]
              <h1 className="text-2xl font-bold text-gray-900">
                Library & Resources [cite: 12]
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Access {notes.length} curated study materials and lecture notes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Download className="h-4 w-4 mr-2" /> Download Syllabus
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Control Bar (Filters & Search) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          {/* Left: Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-2 lg:pb-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right: Search & View Toggle */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Content Area */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-20 md:py-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              <Filter className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No resources found
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setActiveTab("All");
              }}
              className="mt-6"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {filteredNotes.map(note => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-500">
                {/* List Header */}
                <div className="hidden sm:flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="w-10"></div>
                  <div className="flex-1">Title & Subject</div>
                  <div className="w-32">Date Added</div>
                  <div className="hidden md:block w-32">Author</div>
                  <div className="w-10">Action</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredNotes.map(note => (
                    <NoteRow key={note._id} note={note} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
