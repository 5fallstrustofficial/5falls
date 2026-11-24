"use client";

import React from "react";
import Image from "next/image";
import { X, ExternalLink } from "lucide-react";

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  alt: string;
  caption?: string;
}

export default function LightboxModal({
  isOpen,
  onClose,
  imageSrc,
  alt,
  caption,
}: LightboxModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white rounded-modal overflow-hidden border border-[#dce2ea] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#dce2ea] bg-[#f9fafb]">
          <p className="font-semibold text-sm text-ink truncate pr-4">
            {caption || alt || "Puduthangal Lake Documentation"}
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#dce2ea] hover:bg-black/5 flex items-center justify-center text-ink-slate transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Display */}
        <div className="relative aspect-[4/3] max-h-[75vh] w-full bg-slate-950 flex items-center justify-center">
          <Image
            src={imageSrc}
            alt={alt || "Five Falls Trust"}
            fill
            className="object-contain"
          />
        </div>

        {/* Caption bar */}
        <div className="px-5 py-3 bg-[#f9fafb] border-t border-[#dce2ea] flex flex-wrap items-center justify-between gap-2 text-xs text-ink-steel">
          <span>{alt}</span>
          <a
            href={imageSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Open high-res original</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
