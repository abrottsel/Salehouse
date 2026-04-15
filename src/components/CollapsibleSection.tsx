"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ListChecks,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

const iconMap = {
  ListChecks,
  HelpCircle,
  MessageSquare,
} as const;

type IconName = keyof typeof iconMap;

interface Props {
  /** Anchor id — the section auto-opens and scrolls when URL hash matches. */
  id: string;
  title: string;
  icon: IconName;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({
  id,
  title,
  icon,
  children,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const Icon = iconMap[icon];

  // Auto-open when URL hash matches this section's id.
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === id) {
        setOpen(true);
        // Scroll into view after the expand animation starts.
        requestAnimationFrame(() => {
          rootRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [id]);

  return (
    <div
      id={id}
      ref={rootRef}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 scroll-mt-20"
    >
      <div className="rounded-2xl ring-1 ring-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <Icon className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="flex-1 text-base font-bold text-gray-900">
            {title}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="border-t border-gray-100">{children}</div>
        )}
      </div>
    </div>
  );
}
