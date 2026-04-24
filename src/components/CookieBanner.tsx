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
    window.dispatchEvent(new CustomEvent("zemplus:consent", { detail: value }));
  } catch {
    /* ignore */
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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
      className="fixed inset-x-0 bottom-0 z-[100] p-2 sm:p-3 pointer-events-none"
    >
      <div
        className="mx-auto max-w-2xl pointer-events-auto rounded-xl text-white p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
        style={{
          backdropFilter: "blur(16px) saturate(2)",
          background: "linear-gradient(135deg, rgba(10,25,15,0.72) 0%, rgba(5,18,10,0.60) 100%)",
          boxShadow:
            "inset 0 1.5px 0 rgba(255,255,255,0.18), inset 0 -0.5px 0 rgba(255,255,255,0.06), 0 8px 40px -8px rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <p
          className="text-[11px] leading-tight flex-1"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
        >
          Мы используем cookie в соответствии с{" "}
          <a
            href="/privacy"
            className="underline underline-offset-1 hover:text-emerald-300 transition-colors"
          >
            Политикой конфиденциальности
          </a>{" "}
          (152-ФЗ).
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="min-h-11 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 whitespace-nowrap"
            style={{
              backdropFilter: "blur(8px)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              textShadow: "0 1px 3px rgba(0,0,0,0.7)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >
            Только необходимые
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="min-h-11 px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
              boxShadow: "0 4px 16px -2px rgba(22,163,74,0.45), inset 0 1px 0 rgba(255,255,255,0.20)",
              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 20px -2px rgba(22,163,74,0.6), inset 0 1px 0 rgba(255,255,255,0.25)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 16px -2px rgba(22,163,74,0.45), inset 0 1px 0 rgba(255,255,255,0.20)")}
          >
            Принять всё
          </button>
        </div>
      </div>
    </div>
  );
}
