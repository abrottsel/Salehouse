"use client";

import { useCallback } from "react";

/**
 * Russian phone input with locked "+7" prefix and live mask formatting.
 *
 * - Префикс «+7» выделен зелёным и неудаляем
 * - Маска автоматически форматирует «(XXX) XXX-XX-XX» по мере ввода
 * - value всегда содержит только цифры после +7 (до 10 знаков)
 *   — то есть строку вида "9859052555" можно слать в API как есть
 * - Для полной E.164 отправки добавляй "+7" в момент submit
 */

interface PhoneInputProps {
  /** Digits after +7, up to 10 chars, e.g. "9859052555" */
  value: string;
  onChange: (digits: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

function formatMask(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  const parts: string[] = [];
  if (d.length > 0) parts.push("(" + d.slice(0, 3));
  if (d.length >= 3) parts[0] += ")";
  if (d.length > 3) parts.push(" " + d.slice(3, 6));
  if (d.length > 6) parts.push("-" + d.slice(6, 8));
  if (d.length > 8) parts.push("-" + d.slice(8, 10));
  return parts.join("");
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "(___) ___-__-__",
  required = false,
  id,
  name = "phone",
  className = "",
}: PhoneInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
      onChange(digits);
    },
    [onChange]
  );

  const display = formatMask(value);

  return (
    <div
      className={`group flex items-stretch rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all overflow-hidden ${className}`}
    >
      <div className="flex items-center pl-4 pr-2 bg-gradient-to-r from-green-50 to-emerald-50 border-r border-gray-100 select-none">
        <span className="text-lg">🇷🇺</span>
        <span className="ml-1.5 text-base font-bold text-green-700 tabular-nums">
          +7
        </span>
      </div>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        required={required}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 min-w-0 px-3 py-3 bg-transparent text-gray-900 outline-none placeholder:text-gray-400 text-base tabular-nums"
      />
    </div>
  );
}
