"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, PhoneCall, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

export default function Hero() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const valid = phone.length === 10;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          phone: "+7" + phone,
          email: "",
          type: "CALLBACK",
          message: "v3 hero — подобрать участок за 15 минут",
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setPhone("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-stone-950">
      {/* Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-home.jpg"
          alt=""
          className="w-full h-full object-cover scale-105 animate-[kenburns_30s_ease-in-out_infinite_alternate]"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-24">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 text-white/90 text-xs font-bold uppercase tracking-[0.2em] mb-8">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            31 посёлок · 1769+ участков · Подмосковье
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.5rem,7vw,6.5rem)] font-black leading-[0.95] tracking-[-0.03em] text-white mb-6">
            Ваш участок<br />
            <span className="inline-block bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              для жизни мечты
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/80 font-light leading-relaxed mb-10 max-w-2xl">
            Готовые коттеджные посёлки в Подмосковье с газом, электричеством,
            асфальтом и охраной. <span className="text-emerald-300 font-medium">От&nbsp;180&nbsp;000&nbsp;₽&nbsp;за&nbsp;сотку.</span>
          </p>

          {/* Primary CTA: inline callback */}
          {status === "success" ? (
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/20 backdrop-blur-md ring-1 ring-emerald-300/40 text-emerald-100 font-semibold">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              <span>Заявка принята — перезвоним в течение 15 минут</span>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="flex-1 min-w-0">
                <PhoneInput value={phone} onChange={setPhone} required />
              </div>
              <button
                type="submit"
                disabled={!valid || status === "loading"}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] text-white font-bold shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base whitespace-nowrap"
              >
                {status === "loading" ? (
                  "Отправка..."
                ) : (
                  <>
                    <PhoneCall className="w-5 h-5" />
                    Подобрать за 15 минут
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Trust row under CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Юридическая чистота</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ипотека от 6.5%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Бесплатный подбор</span>
            </div>
          </div>

          {/* Secondary action */}
          <div className="mt-10">
            <Link
              href="#villages"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold tracking-wide transition-colors group"
            >
              <MapPin className="w-4 h-4" />
              Смотреть все 31 посёлок
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2 text-white/50 text-xs font-medium tracking-widest uppercase">
        <span>Пролистайте</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/0 via-white/50 to-white/0 animate-[scrollhint_2s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1.05) translate(0, 0); }
          100% { transform: scale(1.12) translate(-2%, -1%); }
        }
        @keyframes scrollhint {
          0%, 100% { opacity: 0.3; transform: translateY(-4px); }
          50% { opacity: 1; transform: translateY(4px); }
        }
      `}</style>
    </section>
  );
}
