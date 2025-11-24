// src/components/ui/Modal.jsx
"use client";

import { X, CheckCircle, AlertTriangle, Info, Bell, Zap } from "lucide-react"; // Changed AlertCircle to AlertTriangle (more common) and added Bell/Zap for variety
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { create } from "zustand";
import { useEffect } from "react";

// Zustand Store for Global Modal Management (Recommended)
const useModalStore = create(set => ({
  isOpen: false,
  title: "",
  content: null,
  type: "default", // default | success | warning | error | info | critical
  onConfirm: null,
  confirmText: "Confirm",
  cancelText: "Cancel",
  hideFooter: false,
  isConfirming: false, // NEW: State to handle loading on confirm button
  open: ({
    title,
    content,
    type = "default",
    onConfirm,
    confirmText,
    cancelText,
    hideFooter,
    isConfirming = false,
  }) =>
    set({
      isOpen: true,
      title,
      content,
      type,
      onConfirm,
      confirmText,
      cancelText,
      hideFooter,
      isConfirming,
    }),
  // NEW: Setter for confirming state
  setConfirming: isConfirming => set({ isConfirming }),
  close: () => set({ isOpen: false, isConfirming: false }),
}));

// Main Modal Component
const Modal = () => {
  const {
    isOpen,
    title,
    content,
    type,
    onConfirm,
    confirmText,
    cancelText,
    hideFooter,
    isConfirming, // Get confirming state
    setConfirming, // Get setter for confirming state
    close,
  } = useModalStore();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === "Escape") close();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, close]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ICON AND STYLE MAPPING (Enhanced colors and shadow)
  const iconMap = {
    success: {
      icon: CheckCircle,
      color: "text-emerald-500",
      shadow: "shadow-emerald-500/10",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-500",
      shadow: "shadow-amber-500/10",
    },
    error: { icon: Zap, color: "text-rose-500", shadow: "shadow-rose-500/10" },
    info: { icon: Info, color: "text-blue-500", shadow: "shadow-blue-500/10" },
    critical: {
      icon: Bell,
      color: "text-red-600",
      shadow: "shadow-red-600/10",
    },
    default: {
      icon: Info,
      color: "text-gray-500",
      shadow: "shadow-gray-500/10",
    },
  };

  const { icon: Icon, color, shadow } = iconMap[type] || iconMap.default;

  const handleConfirm = async () => {
    if (!onConfirm) return;

    // Set loading state
    setConfirming(true);

    try {
      // If onConfirm returns a promise, await it
      await onConfirm();
    } catch (error) {
      console.error("Modal confirmation failed:", error);
      // Keep loading state until explicitly resolved or another action is taken
    } finally {
      // Only close if onConfirm does not handle its own closing (common pattern)
      setConfirming(false);
      close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop (Darker and stronger blur for better depth) */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={close}
      />

      {/* Modal Panel (Premium Card Look) */}
      <div
        className={cn(
          "relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 ease-out duration-300 border border-gray-100/80",
          shadow // Subtle shadow based on type
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6">
          <div className="flex items-center gap-4">
            {/* Icon (Larger and centered) */}
            <div
              className={cn(
                "flex-shrink-0 p-2 rounded-xl",
                color.replace("text-", "bg-") + "/10"
              )}
            >
              <Icon className={cn("h-7 w-7", color)} aria-hidden="true" />
            </div>

            <h2
              id="modal-title"
              className="text-xl font-extrabold text-gray-900 truncate"
            >
              {title}
            </h2>
          </div>
          <button
            onClick={close}
            className="p-2.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body (Better Padding and Scroll Area) */}
        <div className="px-6 pb-6 max-h-[calc(100vh-200px)] overflow-y-auto text-gray-600">
          {content}
        </div>

        {/* Footer (Action Section) */}
        {!hideFooter && (
          <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50/50">
            {/* Cancel Button */}
            <Button
              variant="secondary"
              onClick={close}
              className="flex-1"
              disabled={isConfirming}
            >
              {cancelText || "Cancel"}
            </Button>

            {/* Confirm Button (Uses loading state) */}
            {onConfirm && (
              <Button
                onClick={handleConfirm}
                className="flex-1"
                isLoading={isConfirming} // Pass loading state to button
                variant={
                  type === "error" || type === "critical"
                    ? "destructive"
                    : "primary"
                }
              >
                {confirmText || "Confirm"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Hook to open modal from anywhere
export const useModal = () => {
  const { open, close } = useModalStore();
  return { open, close };
};

export { Modal, useModalStore };
