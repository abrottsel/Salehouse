"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, PhoneCall, Send, MessageCircle } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import { LEGAL } from "@/lib/legal";

/**
 * /v3 — Final CTA.
 * Full-width dark backdrop image, centered headline + inline phone form,
 * 3 alt-contact pills, legal note.
 */

export default function FinalCTA() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  const valid = phone.length === 10;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          phone: "+7" + phone,
          email: "",
          type: "CALLBACK",
          message: "Заявка на обратный звонок · v3 final CTA",
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setPhone("");
    } catch {
      setError("Не удалось отправить. Позвоните: " + LEGAL.phone);
      setStatus("error");
    }
  };

  return (
    <section
      id="v3-final-cta"
      className="relative isolate py-20 lg:py-28 overflow-hidden scroll-mt-16"
    >
      {/* Background image + dark overlay */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/hero-home.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/55 to-black/70"
        aria-hidden
      />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-[11px] font-bold uppercase tracking-wider mb-5 ring-1 ring-emerald-400/30">
          Подбор за 15 минут
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
          Подберём участок под ваш бюджет за 15 минут
        </h2>
        <p className="text-base sm:text-lg text-white/75 mb-10 max-w-xl mx-auto">
          Оставьте номер — менеджер перезвонит, уточнит пожелания и подготовит
          подборку из 3–5 вариантов в Подмосковье.
        </p>

        {/* Form / success */}
        {status === "success" ? (
          <div className="mx-auto max-w-md flex items-center gap-3 p-5 rounded-3xl bg-emerald-500/15 ring-1 ring-emerald-400/40 backdrop-blur text-left">
            <CheckCircle2 className="w-8 h-8 text-emerald-300 shrink-0" />
            <div>
              <div className="font-bold text-base text-white">Заявка принята</div>
              <div className="text-sm text-emerald-100/80">
                Перезвоним в течение 15 минут в рабочее время.
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="mx-auto max-w-md flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 min-w-0">
              <PhoneInput value={phone} onChange={setPhone} required />
            </div>
            <button
              type="submit"
              disabled={!valid || status === "loading"}
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 h-[52px] rounded-full font-bold text-sm shadow-lg shadow-emerald-600/40 transition-all"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Отправка…
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  Перезвоните мне
                </>
              )}
            </button>
          </form>
        )}

        {error && (
          <div className="mt-3 text-sm text-rose-300">{error}</div>
        )}

        {/* Legal note */}
        <p className="mt-4 text-[14px] text-white/50">
          Нажимая «Перезвоните мне», вы соглашаетесь с{" "}
          <a
            href="/privacy"
            className="underline decoration-white/30 hover:text-white hover:decoration-white/60 transition"
          >
            политикой обработки персональных данных
          </a>
          .
        </p>

        {/* Alt contacts */}
        <div className="mt-10">
          <div className="text-xs uppercase tracking-[0.2em] text-white/45 mb-4">
            Или сразу
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={LEGAL.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 h-12 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/20 backdrop-blur text-sm font-semibold transition-all"
            >
              <Send className="w-4 h-4 text-sky-300" />
              Telegram @zemplus
            </a>
            <a
              href={LEGAL.max}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 h-12 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/20 backdrop-blur text-sm font-semibold transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              MAX
            </a>
            <a
              href={`tel:${LEGAL.phoneRaw}`}
              className="inline-flex items-center gap-2 px-5 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-600/40 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              {LEGAL.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
