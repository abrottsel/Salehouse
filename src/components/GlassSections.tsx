"use client";

/**
 * GlassSections — three glass cards on a photo background.
 * Variant 11: blur 4px, visible background, rainbow border.
 * Each card expands on click to show its content.
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
  children: React.ReactNode;
}

export default function GlassSections({ cards }: { cards: CardDef[] }) {
  return (
    <section
      className="relative py-6 lg:py-8 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url(/hero-home.jpg)" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <GlassCard key={card.id} {...card} />
          ))}
        </div>
      </div>

      {/* Rainbow border CSS */}
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

function GlassCard({ id, title, subtitle, icon, children }: CardDef) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const Icon = iconMap[icon];

  // Auto-open when URL hash matches
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === id) {
        setOpen(true);
        requestAnimationFrame(() => {
          rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      className={`glass-section-card overflow-hidden rounded-[20px] transition-all duration-300 scroll-mt-20 ${
        open ? "shadow-2xl" : "shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      }`}
      style={{
        backdropFilter: "blur(4px) saturate(1.8)",
        WebkitBackdropFilter: "blur(4px) saturate(1.8)",
        background: "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        boxShadow: open
          ? "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(255,255,255,0.05), 0 16px 48px -8px rgba(0,0,0,0.35)"
          : "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(255,255,255,0.05), 0 12px 40px -8px rgba(0,0,0,0.3)",
      }}
    >
      {/* Specular highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/[0.4] to-transparent" />

      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-5 lg:p-6 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-md shrink-0">
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-black text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            {title}
          </div>
          <div className="text-xs text-white/60 mt-0.5">{subtitle}</div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-white/40 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content — expands on click */}
      {open && (
        <div className="px-5 lg:px-6 pb-5 lg:pb-6 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}
