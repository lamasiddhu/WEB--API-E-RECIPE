"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles } from "lucide-react";
import AiSearchAssistant from "../search/AiSearchAssistant";

interface AiAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiAssistantPanel({ isOpen, onClose }: AiAssistantPanelProps) {
  // Rendered via a portal straight into <body> so its `fixed` positioning is
  // always relative to the real viewport — Sidebar's parent wrapper has a
  // `transform` class on it (for the mobile slide-in), and any CSS transform
  // on an ancestor turns `position: fixed` descendants into being positioned
  // relative to that ancestor instead of the screen, which is what made this
  // panel render at the wrong size/position before.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return createPortal(
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-[100]" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl z-[110] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <span className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <Sparkles className="w-5 h-5 text-[#B34B20]" /> AI Recipe Assistant
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 p-4">
          <AiSearchAssistant />
        </div>
      </div>
    </>,
    document.body
  );
}
