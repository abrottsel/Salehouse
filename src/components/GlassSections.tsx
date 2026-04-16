"use client";

/**
 * GlassSections — three glass cards on a photo background.
 * Click a card → content expands BELOW all three cards at full width.
 * Only one section open at a time (accordion behavior).
 */

import { useState, useEffect, useRef } from "react";
import { ListChecks, HelpCircle, MessageSquare, ChevronDown } from "lucide-react";

const iconMap = { ListChecks, HelpCircle, MessageSquare } as const;
type IconName = keyof typeof iconMap;

interface CardDef {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  photo?: string;
  children: React.ReactNode;
}

export default function GlassSections({ cards }: { cards: CardDef[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => {
    setActiveId((prev) => {
      const next = prev === id ? null : id;
      if (next) {
        requestAnimationFrame(() => {
          contentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
      return next;
    });
  };

  // Auto-open from URL hash
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace("#", "");
      const match = cards.find((c) => c.id === hash);
      if (match) {
        setActiveId(match.id);
        requestAnimationFrame(() => {
          contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [cards]);

  const activeCard = cards.find((c) => c.id === activeId);

  return (
    <section
      className="relative py-6 lg:py-8 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url(/hero-home.jpg)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Three cards in a row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const Icon = iconMap[card.icon];
            const isActive = activeId === card.id;
            return (
              <button
                key={card.id}
                id={card.id}
                type="button"
                onClick={() => toggle(card.id)}
                className={`glass-section-card overflow-hidden rounded-[20px] text-left transition-all duration-300 scroll-mt-20 bg-cover bg-center ${
                  isActive
                    ? "shadow-2xl ring-2 ring-white/30"
                    : "shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                }`}
                style={{
                  backgroundImage: card.photo ? `url(${card.photo})` : undefined,
                  boxShadow: isActive
                    ? "inset 0 1px 0 rgba(255,255,255,0.3), 0 16px 48px -8px rgba(0,0,0,0.35)"
                    : "inset 0 1px 0 rgba(255,255,255,0.3), 0 12px 40px -8px rgba(0,0,0,0.3)",
                }}
              >
                {card.photo && <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50" />}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/[0.4] to-transparent" />
                <div className="relative z-10 flex items-center gap-3 p-5 lg:p-6">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-md shrink-0">
                    <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-black text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                      {card.title}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">{card.subtitle}</div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-white/40 shrink-0 transition-transform duration-300 ${
                      isActive ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Expanded content — full width below all cards */}
        {activeCard && (
          <div
            ref={contentRef}
            className="mt-4 glass-section-card rounded-[20px] overflow-hidden transition-all duration-300"
            style={{
              backdropFilter: "blur(8px) saturate(1.6)",
              WebkitBackdropFilter: "blur(8px) saturate(1.6)",
              background: "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 16px 48px -8px rgba(0,0,0,0.35)",
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/[0.5] to-transparent" />
            <div className="p-5 lg:p-8">
              {activeCard.children}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .glass-section-card {
          position: relative;
        }
        .glass-section-card::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: inherit;
          padding: 1.5px;
          background: conic-gradient(
            from 0deg,
            rgba(255,0,0,0.3),
            rgba(255,165,0,0.3),
            rgba(255,255,0,0.2),
            rgba(0,255,0,0.2),
            rgba(0,200,255,0.3),
            rgba(100,100,255,0.3),
            rgba(200,0,255,0.3),
            rgba(255,0,0,0.3)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
    </section>
  );
}
