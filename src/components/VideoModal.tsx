"use client";

import React from "react";
import { X, Play } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title: string;
}

export default function VideoModal({ isOpen, onClose, videoSrc, title }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-modal overflow-hidden border border-[#dce2ea] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#dce2ea] bg-[#f9fafb]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-ink truncate max-w-[420px]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#dce2ea] hover:bg-black/5 flex items-center justify-center text-ink-slate transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-[9/16] max-h-[70vh] mx-auto bg-black flex items-center justify-center">
          <video
            src={videoSrc}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-[#f9fafb] border-t border-[#dce2ea] flex items-center justify-between text-xs text-ink-steel">
          <span>Source: Five Falls Women&apos;s Welfare Trust (@5falls.trust)</span>
          <span className="font-semibold text-primary">Original HD Video</span>
        </div>
      </div>
    </div>
  );
}
