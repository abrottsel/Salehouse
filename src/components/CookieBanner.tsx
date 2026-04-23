"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "zemplus_cookie_consent";
const CONSENT_VERSION = "1";

type ConsentValue = "accepted" | "rejected" | null;

function readConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v: string; value: ConsentValue };
    if (parsed.v !== CONSENT_VERSION) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

function writeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ v: CONSENT_VERSION, value, ts: Date.now() }),
    );
    // Эмитируем событие для аналитики/компонентов, чтобы они
    // могли подцепить только после согласия.
    window.dispatchEvent(new CustomEvent("zemplus:consent", { detail: value }));
  } catch {
    /* ignore — consent просто не запомнится */
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Показываем только если юзер ещё не решил. SSR-safe: на сервере
    // useEffect не выполняется, поэтому баннер не мигает при hydration.
    if (readConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (value: Exclude<ConsentValue, null>) => {
    writeConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4 pointer-events-none"
    >
      <div
        className="mx-auto max-w-3xl pointer-events-auto rounded-2xl bg-gray-900/95 backdrop-blur-md text-white shadow-2xl ring-1 ring-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
      >
        <p className="text-sm leading-snug flex-1">
          Мы используем cookie и обрабатываем персональные данные только с
          вашего согласия — в соответствии с{" "}
          <a
            href="/privacy"
            className="underline underline-offset-2 hover:text-emerald-300"
          >
            Политикой конфиденциальности
          </a>{" "}
          (152-ФЗ). Без согласия работают только технически необходимые cookies.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="px-4 py-2 rounded-xl text-xs font-bold ring-1 ring-white/25 hover:bg-white/10 transition"
          >
            Только необходимые
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            Принять всё
          </button>
        </div>
      </div>
    </div>
  );
}
