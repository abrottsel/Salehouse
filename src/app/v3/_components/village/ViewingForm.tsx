"use client";

import { useId, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { Accent, Eyebrow, glassStyle } from "../ui/primitives";
import { useTier } from "../../_lib/perf";

/**
 * Запись на просмотр — тёмный премиум.
 *
 * ВАЖНО: форма демонстрационная и НИЧЕГО не отправляет. Ни fetch, ни
 * server action — по сабмиту просто переключается локальное состояние на
 * экран благодарности. Когда витрину будут ставить на прод, сюда надо
 * подключить боевой /api/leads (как в src/components/ViewingModal.tsx).
 *
 * Формулировки («Посмотреть вживую», «Запись на просмотр», «Заявка
 * принята!», «Менеджер перезвонит и подтвердит запись») взяты из боевой
 * модалки записи.
 */

/** Телефон в вид +7 (999) 123-45-67. Номера российские, 8 приводим к 7. */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  let d = digits;
  if (d.startsWith("8")) d = `7${d.slice(1)}`;
  if (!d.startsWith("7")) d = `7${d}`;
  d = d.slice(0, 11);
  const rest = d.slice(1);
  let out = "+7";
  if (rest.length) out += ` (${rest.slice(0, 3)}`;
  if (rest.length > 3) out += `) ${rest.slice(3, 6)}`;
  if (rest.length > 6) out += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) out += `-${rest.slice(8, 10)}`;
  return out;
}

const digitsOf = (s: string) => s.replace(/\D/g, "");

export default function ViewingForm({ villageName }: { villageName: string }) {
  const tier = useTier();
  const lite = tier === "lite";

  const nameId = useId();
  const phoneId = useId();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Напишите, как к вам обращаться");
      return;
    }
    if (digitsOf(phone).length !== 11) {
      setError("Телефон нужен целиком — 11 цифр");
      return;
    }
    setError(null);
    // Осознанно без отправки: это витрина-стенд.
    setSent(true);
  };

  const field =
    "h-13 w-full rounded-[16px] bg-white/[0.06] px-4 text-[15px] text-white outline-none ring-1 ring-white/12 transition-colors placeholder:text-white/35 focus:bg-white/[0.10] focus:ring-emerald-400/50";

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <Eyebrow>
          <CalendarCheck className="h-3 w-3" />
          Посмотреть вживую
        </Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold leading-[1.08] sm:text-5xl">
          Запись <Accent>на просмотр</Accent>
        </h2>
        <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white/55 sm:text-[17px]">
          Покажем {villageName} на месте. Оставьте имя и телефон — менеджер перезвонит и подтвердит
          запись.
        </p>
      </div>

      <div className="lg:col-span-7">
        <div className="rounded-[28px] p-5 sm:p-7" style={glassStyle}>
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: lite ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: lite ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="py-6 text-center"
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 ring-1 ring-emerald-400/40">
                  <CheckCircle2 className="h-8 w-8 text-emerald-300" />
                </div>
                <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">Заявка принята!</h3>
                <p className="mx-auto mt-3 max-w-[38ch] text-[15px] leading-relaxed text-white/60">
                  {name.trim()}, менеджер перезвонит на {phone} и подтвердит запись. Посёлок
                  «{villageName}».
                </p>
                <p className="mt-5 text-[11px] text-white/30">
                  Демо-стенд: заявка никуда не отправлена.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                noValidate
                initial={false}
                exit={{ opacity: 0 }}
                transition={{ duration: lite ? 0.15 : 0.25 }}
                className="flex flex-col gap-3"
              >
                <div>
                  <label
                    htmlFor={nameId}
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/40"
                  >
                    Имя
                  </label>
                  <input
                    id={nameId}
                    type="text"
                    autoComplete="name"
                    placeholder="Как к вам обращаться"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={field}
                  />
                </div>

                <div>
                  <label
                    htmlFor={phoneId}
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/40"
                  >
                    Телефон
                  </label>
                  <input
                    id={phoneId}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className={`${field} tabular-nums`}
                  />
                </div>

                {error && (
                  <p role="alert" className="text-[13px] font-semibold text-rose-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-1 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-[15px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98]"
                >
                  <CalendarCheck className="h-5 w-5" />
                  Записаться на просмотр
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
