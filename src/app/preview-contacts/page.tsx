"use client";

import { Phone, Mail, MessageCircle, Sparkles, Send } from "lucide-react";

const VARIANTS = [
  {
    label: "1 — Мятный frosted (как калькулятор)",
    sectionBg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 60%, #d1fae5 80%, #ecfdf5 100%)",
    cardBg: "linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.5))",
    cardShadow: "inset 0 1px 0 rgba(255,255,255,0.95),0 4px 16px -4px rgba(5,150,105,0.08)",
    textColor: "text-gray-900", descColor: "text-emerald-900/55", btnBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
    rainbow: true, dark: false,
  },
  {
    label: "2 — Стекло на фото (как секции FAQ)",
    sectionBg: undefined, sectionPhoto: "/hero-home.jpg",
    cardBg: "linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))",
    cardShadow: "inset 0 1px 0 rgba(255,255,255,0.3),0 12px 40px -8px rgba(0,0,0,0.3)",
    textColor: "text-white", descColor: "text-white/60", btnBg: "bg-white/90 hover:bg-white text-emerald-700",
    rainbow: true, dark: true, blur: 4,
  },
  {
    label: "3 — Белый чистый + зелёные акценты",
    sectionBg: "#ffffff",
    cardBg: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
    cardShadow: "0 2px 12px -2px rgba(0,0,0,0.06)",
    textColor: "text-gray-900", descColor: "text-gray-500", btnBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
    rainbow: false, dark: false, border: "1px solid rgba(16,185,129,0.2)",
  },
  {
    label: "4 — Тёмный элегантный",
    sectionBg: "linear-gradient(135deg,#0f172a,#1e293b)",
    cardBg: "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))",
    cardShadow: "inset 0 1px 0 rgba(255,255,255,0.15),0 8px 32px -4px rgba(0,0,0,0.3)",
    textColor: "text-white", descColor: "text-white/50", btnBg: "bg-emerald-500 hover:bg-emerald-400 text-white",
    rainbow: true, dark: true,
  },
  {
    label: "5 — Зелёный gradient + стекло",
    sectionBg: "linear-gradient(135deg,#1a3a2a,#2d5a3f,#1a3a2a)",
    cardBg: "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))",
    cardShadow: "inset 0 1px 0 rgba(255,255,255,0.2),0 8px 32px -4px rgba(0,0,0,0.2)",
    textColor: "text-white", descColor: "text-white/60", btnBg: "bg-white hover:bg-white/90 text-emerald-800",
    rainbow: true, dark: true,
  },
  {
    label: "6 — Две колонки стекло на фото",
    sectionBg: undefined, sectionPhoto: "/villages/red/01.jpg",
    cardBg: "linear-gradient(160deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))",
    cardShadow: "inset 0 1px 0 rgba(255,255,255,0.35),0 16px 48px -8px rgba(0,0,0,0.3)",
    textColor: "text-white", descColor: "text-white/70", btnBg: "bg-emerald-500 hover:bg-emerald-400 text-white",
    rainbow: true, dark: true, blur: 6,
  },
  {
    label: "7 — Пастельный розово-мятный",
    sectionBg: "linear-gradient(135deg,#ecfdf5 0%,#fdf2f8 50%,#ecfdf5 100%)",
    cardBg: "linear-gradient(135deg,rgba(255,255,255,0.8),rgba(255,255,255,0.55))",
    cardShadow: "inset 0 1px 0 rgba(255,255,255,0.95),0 4px 20px -4px rgba(0,0,0,0.06)",
    textColor: "text-gray-900", descColor: "text-gray-500", btnBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
    rainbow: true, dark: false,
  },
  {
    label: "8 — Карточки с цветными боками",
    sectionBg: "#f8fafc",
    cardBg: "#ffffff",
    cardShadow: "0 4px 20px -4px rgba(0,0,0,0.08)",
    textColor: "text-gray-900", descColor: "text-gray-500", btnBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
    rainbow: false, dark: false, border: "1px solid #e5e7eb", leftAccent: true,
  },
  {
    label: "9 — Неоморфизм мятный",
    sectionBg: "#e8f5e9",
    cardBg: "linear-gradient(145deg,#f0f7f0,#dce8dc)",
    cardShadow: "8px 8px 20px rgba(0,0,0,0.06),-8px -8px 20px rgba(255,255,255,0.8),inset 0 1px 0 rgba(255,255,255,0.6)",
    textColor: "text-gray-800", descColor: "text-gray-500", btnBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
    rainbow: false, dark: false,
  },
  {
    label: "10 — Frosted на аэрофото (premium)",
    sectionBg: undefined, sectionPhoto: "/villages/favorit/03.jpg",
    cardBg: "linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.45))",
    cardShadow: "inset 0 1px 0 rgba(255,255,255,0.9),0 8px 32px -4px rgba(0,0,0,0.15)",
    textColor: "text-gray-900", descColor: "text-gray-600", btnBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
    rainbow: true, dark: false, blur: 16,
  },
];

export default function PreviewContactsPage() {
  return (
    <main className="min-h-screen bg-gray-200 py-8 space-y-12">
      <h1 className="text-center text-3xl font-black text-gray-900">Контакты — 10 вариантов</h1>

      <style>{`
        .ct-rainbow { position:relative; }
        .ct-rainbow::before {
          content:'';position:absolute;inset:-1.5px;border-radius:inherit;padding:1.5px;
          background:conic-gradient(from 0deg,rgba(255,0,0,0.25),rgba(255,165,0,0.25),rgba(255,255,0,0.18),rgba(0,255,0,0.18),rgba(0,200,255,0.25),rgba(100,100,255,0.25),rgba(200,0,255,0.25),rgba(255,0,0,0.25));
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:1;
        }
      `}</style>

      {VARIANTS.map((v, vi) => (
        <div key={vi}>
          <h2 className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-lg font-black text-gray-800 mb-3">{v.label}</h2>
          <section
            className="relative py-8 lg:py-12 overflow-hidden bg-cover bg-center"
            style={{
              background: (v as any).sectionPhoto ? undefined : (v.sectionBg || "#fff"),
              backgroundImage: (v as any).sectionPhoto ? `url(${(v as any).sectionPhoto})` : undefined,
              backgroundSize: "cover", backgroundPosition: "center",
            }}
          >
            {(v as any).sectionPhoto && <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />}

            <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 ${v.dark ? "bg-white/10 ring-1 ring-white/20 text-white/80" : "bg-emerald-100 text-emerald-800"}`}>
                  <Sparkles className="w-3.5 h-3.5" />Свяжитесь с нами
                </div>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${v.textColor}`}>
                  Готовы <span className={v.dark ? "text-emerald-300" : "text-emerald-600"}>обсудить</span> ваш участок?
                </h2>
                <p className={`text-sm mt-1 ${v.descColor}`}>Оставьте заявку — мы поможем подобрать идеальный вариант</p>
              </div>

              <div className="lg:grid lg:grid-cols-2 gap-6">
                {/* Left — contacts */}
                <div
                  className={`rounded-2xl p-5 lg:p-6 ${v.rainbow ? "ct-rainbow" : ""} overflow-hidden relative`}
                  style={{
                    background: v.cardBg,
                    boxShadow: v.cardShadow,
                    border: (v as any).border || "none",
                    ...(v as any).blur ? { backdropFilter: `blur(${(v as any).blur}px) saturate(1.6)` } : {},
                    ...(v as any).leftAccent ? { borderLeft: "4px solid #059669" } : {},
                  }}
                >
                  <div className={`text-lg font-black mb-4 ${v.textColor}`}>Перезвоним за 15 минут</div>
                  <div className="space-y-3">
                    {[
                      { Icon: Phone, text: "+7 (985) 905-25-55", sub: "Ежедневно 9:00–21:00" },
                      { Icon: Mail, text: "info@zem-plus.ru", sub: "Написать на почту" },
                      { Icon: MessageCircle, text: "@zemplus", sub: "Telegram — ответим быстро" },
                    ].map((c) => (
                      <div key={c.text} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${v.dark ? "bg-white/15" : "bg-emerald-100"}`}>
                          <c.Icon className={`w-4 h-4 ${v.dark ? "text-white" : "text-emerald-600"}`} />
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${v.textColor}`}>{c.text}</div>
                          <div className={`text-[11px] ${v.descColor}`}>{c.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — form */}
                <div
                  className={`rounded-2xl p-5 lg:p-6 mt-4 lg:mt-0 ${v.rainbow ? "ct-rainbow" : ""} overflow-hidden relative`}
                  style={{
                    background: v.cardBg,
                    boxShadow: v.cardShadow,
                    border: (v as any).border || "none",
                    ...(v as any).blur ? { backdropFilter: `blur(${(v as any).blur}px) saturate(1.6)` } : {},
                    ...(v as any).leftAccent ? { borderLeft: "4px solid #059669" } : {},
                  }}
                >
                  <div className={`text-lg font-black mb-4 ${v.textColor}`}>Оставить заявку</div>
                  <div className="space-y-3">
                    <div className={`h-11 rounded-xl ${v.dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white ring-1 ring-gray-200"} flex items-center px-4 ${v.descColor} text-sm`}>Ваше имя *</div>
                    <div className={`h-11 rounded-xl ${v.dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white ring-1 ring-gray-200"} flex items-center px-4 ${v.descColor} text-sm`}>+7 (___) ___-__-__</div>
                    <div className={`h-20 rounded-xl ${v.dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white ring-1 ring-gray-200"} flex items-start px-4 pt-3 ${v.descColor} text-sm`}>Ваши пожелания...</div>
                    <button className={`w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg ${v.btnBg}`}>
                      <Send className="w-4 h-4" />Отправить заявку
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ))}
    </main>
  );
}
