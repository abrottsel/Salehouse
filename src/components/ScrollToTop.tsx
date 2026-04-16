"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle } from "lucide-react";

/**
 * Floating bottom-left: "Наверх" button + Telegram & WhatsApp icons.
 * Telegram links to @zemplus bot. WhatsApp is a placeholder for now.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname() || "";
  const hidden = pathname.startsWith("/v2");

  useEffect(() => {
    if (hidden) return;
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hidden]);

  if (hidden) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-5 left-5 z-40 flex items-center gap-2 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {/* Back to top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Вернуться наверх"
        className="inline-flex items-center gap-2 h-11 pl-3 pr-4 rounded-full bg-gray-900/90 text-white text-sm font-semibold shadow-xl shadow-black/20 ring-1 ring-white/10 hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm shadow-green-900/40">
          <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
        Наверх
      </button>

      {/* Telegram */}
      <a
        href="https://t.me/zemplus"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        className="w-11 h-11 rounded-full bg-[#2AABEE] hover:bg-[#229ED9] flex items-center justify-center shadow-xl shadow-black/15 hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      </a>

      {/* MAX (VK Messenger) — placeholder */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); alert("MAX скоро будет подключён"); }}
        aria-label="MAX"
        className="w-11 h-11 rounded-full bg-[#0077FF] hover:bg-[#0066DD] flex items-center justify-center shadow-xl shadow-black/15 hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <span className="text-white text-xs font-black tracking-tight">MAX</span>
      </a>
    </div>
  );
}
