"use client";

import { useState } from "react";
import { PhoneCall, CheckCircle2, Loader2 } from "lucide-react";
import PhoneInput from "./PhoneInput";

/**
 * Компактная inline-форма «Оставьте номер — перезвоним за 15 минут».
 * Одно поле — телефон. Минимум трения.
 * Шлёт в тот же /api/leads, type: CALLBACK.
 */

interface Props {
  /** Дополнительный контекст, уезжает в message. Например «со страницы Каретный ряд» */
  context?: string;
  /** Компактная версия без заголовков */
  compact?: boolean;
  className?: string;
}

export default function CallbackForm({
  context,
  compact = false,
  className = "",
}: Props) {
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string>("");

  const valid = phone.length === 10 && agree;

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
          message: context
            ? `Заявка на обратный звонок · ${context}`
            : "Заявка на обратный звонок",
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setPhone("");
    } catch {
      setError("Не удалось отправить. Позвоните нам: +7 (985) 905-25-55");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 ${className}`}
      >
        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
        <div>
          <div className="font-bold text-sm">Заявка принята</div>
          <div className="text-xs text-green-700/80">
            Перезвоним в течение 15 минут в рабочее время.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={className}>
      {!compact && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-600/30">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">
                Перезвоним за 15 минут
              </div>
              <div className="text-xs text-white/60">
                Расскажем про посёлки и подберём участок под ваш бюджет
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 min-w-0">
          <PhoneInput value={phone} onChange={setPhone} required />
        </div>
        <button
          type="submit"
          disabled={!valid || status === "loading"}
          className="shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 h-[52px] rounded-xl font-bold text-sm shadow-lg shadow-green-600/30 transition-all"
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
      </div>

      {!compact && (
        <label className="mt-3 flex items-start gap-2 text-[11px] text-white/60 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 w-3.5 h-3.5 accent-green-600"
          />
          <span>
            Нажимая кнопку, вы соглашаетесь с{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              политикой обработки персональных данных
            </a>
          </span>
        </label>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-600">{error}</div>
      )}
    </form>
  );
}
