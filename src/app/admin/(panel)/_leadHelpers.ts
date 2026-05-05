import type { LeadStatus, LeadType } from "@prisma/client";

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  CONTACTED: "Связались",
  QUALIFIED: "Квалифицирован",
  WON: "Сделка",
  LOST: "Слив",
  TEST: "Тест",
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-sky-100 text-sky-800 ring-sky-200",
  IN_PROGRESS: "bg-amber-100 text-amber-800 ring-amber-200",
  CONTACTED: "bg-violet-100 text-violet-800 ring-violet-200",
  QUALIFIED: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  WON: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  LOST: "bg-gray-200 text-gray-700 ring-gray-300",
  TEST: "bg-zinc-100 text-zinc-600 ring-zinc-300",
};

export const LEAD_TYPE_LABELS: Record<string, string> = {
  VIEWING: "Просмотр",
  PRESENTATION: "Презентация",
  MORTGAGE: "Ипотека",
  BOOKING: "Бронирование",
  CALLBACK: "Перезвонить",
  HOUSE_CONSTRUCTION: "Строительство",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Сайт",
  TELEGRAM_BOT: "TG-бот",
  PHONE_CALL: "Звонок",
  OTHER: "Другое",
};

export const ALL_STATUSES: LeadStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "QUALIFIED",
  "WON",
  "LOST",
  "TEST",
];

export const ALL_TYPES: LeadType[] = [
  "VIEWING",
  "PRESENTATION",
  "MORTGAGE",
  "BOOKING",
  "CALLBACK",
  "HOUSE_CONSTRUCTION",
];

export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11 && (d.startsWith("7") || d.startsWith("8"))) {
    return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  }
  if (d.length === 10) {
    return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
  }
  return raw;
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date >= today;
  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return `сегодня ${time}`;
  return `${date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  })} ${time}`;
}
