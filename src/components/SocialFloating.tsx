"use client";

/**
 * SocialFloating — MAX + Telegram icons fixed bottom-right,
 * horizontal row, left of "Подберу участок" button.
 * Order: MAX (left) → Telegram (right) → Подберу участок (rightmost)
 */

export default function SocialFloating() {
  return (
    <div className="fixed right-4 sm:right-5 top-[68px] z-30 flex gap-2">
      {/* MAX (VK Messenger) — placeholder */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); }}
        aria-label="MAX Messenger"
        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 ring-1 ring-white/20"
        style={{ background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)" }}
      >
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.03 2 11c0 2.83 1.49 5.35 3.81 6.97L5 22l4.19-2.19c.9.19 1.84.19 2.81.19 5.52 0 10-4.03 10-9S17.52 2 12 2zm-1.5 12.5l-2.5-2.5 1.06-1.06L10.5 12.38l3.94-3.94L15.5 9.5l-5 5z"/>
        </svg>
      </a>

      {/* Telegram */}
      <a
        href="https://t.me/zemplus"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        className="w-11 h-11 rounded-2xl bg-[#2AABEE] hover:bg-[#229ED9] flex items-center justify-center shadow-lg shadow-[#2AABEE]/30 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 ring-1 ring-white/20"
      >
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      </a>
    </div>
  );
}
