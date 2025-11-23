// components/note/NoteCard.jsx
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";
import { ProgressBar } from "../ui/ProgressBar";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils"; // Required for cleaner classes

export default function NoteCard({ note, onClick, progress = 0 }) {
  const formatDate = date => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const noteProgress = Math.round(progress);
  const isCompleted = noteProgress >= 100;

  return (
    <Card
      // Clean, professional white card with a subtle shadow and purple accent on hover
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-white border border-gray-200 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-400",
        isCompleted && "border-green-400 shadow-lg shadow-green-200/50"
      )}
      onClick={onClick}
    >
      {/* Subtle top border accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 group-hover:h-2" />

      <div className="p-7 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Primary Icon */}
            <div className="p-4 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30">
              <FileText className="h-8 w-8 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900 line-clamp-2 transition-colors group-hover:text-indigo-600">
                {note.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {note.chapterTitle || "Chapter Resource"}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <Badge
            variant={isCompleted ? "success" : "secondary"}
            className="text-sm font-semibold px-4 py-1"
          >
            {isCompleted ? "Completed" : "Note"}
          </Badge>
        </div>

        {/* Progress Tracker */}
        {progress > 0 && (
          <div className="mb-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm text-indigo-700 mb-2">
              <span>Reading Progress</span>
              <span className="font-bold">{noteProgress}%</span>
            </div>
            {/* Progress Bar with Indigo/Purple theme */}
            <ProgressBar
              value={noteProgress}
              color={isCompleted ? "bg-green-500" : "bg-indigo-500"}
            />
          </div>
        )}

        {/* Meta Data */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-gray-600 mt-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium">
              {note.createdBy?.name || "Expert Team"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span className="text-sm">{formatDate(note.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons (Always visible or subtle transition) */}
        <div className="mt-8 flex gap-4 border-t border-gray-100 pt-6">
          <button
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-3 text-lg"
            onClick={e => {
              e.stopPropagation();
              onClick();
            }} // Ensure onClick fires
          >
            <Eye className="h-5 w-5" />
            Start Reading
          </button>
          <a
            href={note.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            // High-contrast download button
            className="p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all shadow-md flex items-center justify-center"
            onClick={e => e.stopPropagation()}
            aria-label="Download Note PDF"
          >
            <Download className="h-6 w-6 text-indigo-700" />
          </a>
        </div>
      </div>
    </Card>
  );
}
