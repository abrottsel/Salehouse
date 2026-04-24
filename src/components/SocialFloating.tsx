"use client";

/**
 * SocialFloating — Telegram + MAX floating bottom-left,
 * right of "Наверх" button. Uses official MAX logo.
 */

export default function SocialFloating() {
  return (
    <div className="fixed right-[60px] sm:right-[220px] bottom-2 sm:bottom-3 z-40 flex items-center gap-1 sm:gap-2">
      {/* Telegram — official logo */}
      <a
        href="https://t.me/zemplus"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-[#2AABEE]/30 hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <img src="/telegram-logo.png" alt="Telegram" className="w-full h-full object-contain" />
      </a>

      {/* MAX — official logo */}
      <a
        href="https://max.ru/id503440358928_bot"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="MAX Messenger"
        className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20 hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <img src="/max-logo.png" alt="MAX" className="w-full h-full object-contain" />
      </a>
    </div>
  );
}
