"use client";

import { useMemo, useState } from "react";
import {
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  Loader2,
  Filter,
} from "lucide-react";
import {
  ALL_STATUSES,
  ALL_TYPES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_TYPE_LABELS,
  LEAD_SOURCE_LABELS,
  formatDate,
  formatPhone,
} from "../_leadHelpers";

type Lead = {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  type: string;
  status: string;
  source: string;
  villageSlug: string | null;
  plotNumber: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referer: string | null;
  tgSent: boolean;
  tgError: string | null;
};

const QUIZ_LABELS: Record<string, { title: string; values: Record<string, string> }> = {
  area: {
    title: "Площадь",
    values: { "5-7": "5–7 соток", "7-10": "7–10 соток", "10-15": "10–15 соток", any: "Любая" },
  },
  budget: {
    title: "Бюджет",
    values: { "<1m": "до 1 млн", "1-2m": "1–2 млн", "2-3m": "2–3 млн", "3m+": "3+ млн" },
  },
  direction: {
    title: "Направление",
    values: { north: "Север", south: "Юг", east: "Восток", any: "Любое" },
  },
  goal: {
    title: "Цель",
    values: { live: "Жить", dacha: "Дача", invest: "Инвест", build: "Строить" },
  },
  timing: {
    title: "Готовность",
    values: { now: "Сейчас", month: "Месяц", season: "Сезон", look: "Смотрю" },
  },
};

function parseQuizAnswers(message: string | null): Record<string, string> | null {
  if (!message) return null;
  // Quiz lead format: "[QUIZ_LEAD · homepage]\n{...}"
  const m = message.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[0]);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
    return null;
  } catch {
    return null;
  }
}

function humanizeAnswer(key: string, value: string): { title: string; label: string } {
  const meta = QUIZ_LABELS[key];
  if (!meta) return { title: key, label: value };
  return {
    title: meta.title,
    label: meta.values[value] ?? value,
  };
}

export default function LeadsClient({ initial }: { initial: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initial);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Inputs are <input type="date"> → "YYYY-MM-DD" in local time. Convert
    // to absolute UTC bounds: from = 00:00:00 of start day, to = 23:59:59 of end day.
    const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;
    return leads.filter((l) => {
      if (filterStatus && l.status !== filterStatus) return false;
      if (filterType && l.type !== filterType) return false;
      if (fromTs !== null || toTs !== null) {
        const ts = new Date(l.createdAt).getTime();
        if (fromTs !== null && ts < fromTs) return false;
        if (toTs !== null && ts > toTs) return false;
      }
      if (q) {
        const hay = `${l.name} ${l.phone} ${l.email ?? ""} ${l.villageSlug ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, filterStatus, filterType, dateFrom, dateTo, search]);

  const resetDates = () => {
    setDateFrom("");
    setDateTo("");
  };
  const setRangeToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDateFrom(today);
    setDateTo(today);
  };
  const setRangeWeek = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 6);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));
  };
  const setRangeMonth = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 29);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const updateStatus = async (id: string, status: string) => {
    setPendingId(id);
    // Optimistic update
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      const res = await fetch(`/api/admin/site/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        // Revert on failure
        setLeads(initial);
      }
    } catch {
      setLeads(initial);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="space-y-2 mb-4">
        {/* Date range row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mr-1">
            Дата:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            max={dateTo || undefined}
            className="bg-white border border-gray-200 rounded-lg px-2.5 h-9 text-sm text-gray-700 focus:border-emerald-500 outline-none tabular-nums"
            aria-label="Дата от"
          />
          <span className="text-gray-400 text-sm">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || undefined}
            className="bg-white border border-gray-200 rounded-lg px-2.5 h-9 text-sm text-gray-700 focus:border-emerald-500 outline-none tabular-nums"
            aria-label="Дата до"
          />
          <div className="flex items-center gap-1 ml-1">
            <button
              type="button"
              onClick={setRangeToday}
              className="px-2.5 h-9 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-emerald-300 transition"
            >
              Сегодня
            </button>
            <button
              type="button"
              onClick={setRangeWeek}
              className="px-2.5 h-9 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-emerald-300 transition"
            >
              7 дн
            </button>
            <button
              type="button"
              onClick={setRangeMonth}
              className="px-2.5 h-9 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-emerald-300 transition"
            >
              30 дн
            </button>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={resetDates}
                className="px-2.5 h-9 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 transition"
              >
                Сброс
              </button>
            )}
          </div>
        </div>

        {/* Other filters */}
        <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-8 pr-3 h-9 text-sm font-medium text-gray-700 focus:border-emerald-500 outline-none"
          >
            <option value="">Все статусы</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 h-9 text-sm font-medium text-gray-700 focus:border-emerald-500 outline-none"
        >
          <option value="">Все типы</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>
              {LEAD_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск: имя / телефон / посёлок"
          className="flex-1 min-w-[180px] bg-white border border-gray-200 rounded-lg px-3 h-9 text-sm focus:border-emerald-500 outline-none"
        />

        <span className="ml-auto text-xs text-gray-500 tabular-nums">
          {filtered.length} из {leads.length}
        </span>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-gray-500">
            Ничего не найдено.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((lead) => {
              const isOpen = expanded.has(lead.id);
              const quiz = parseQuizAnswers(lead.message);
              const isPending = pendingId === lead.id;
              return (
                <li key={lead.id} className="text-sm">
                  {/* Compact row */}
                  <div className="px-4 sm:px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(lead.id)}
                      className="text-gray-400 hover:text-gray-700 -ml-1 p-1 transition"
                      aria-label={isOpen ? "Свернуть" : "Развернуть"}
                    >
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <span className="text-[11px] text-gray-400 tabular-nums w-24 sm:w-32 shrink-0">
                      {formatDate(lead.createdAt)}
                    </span>

                    <span className="font-bold text-gray-900 min-w-0 truncate flex-1 sm:flex-none sm:basis-40">
                      {lead.name || <em className="text-gray-400 font-normal">без имени</em>}
                    </span>

                    {/* Tap-to-call */}
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-emerald-600 text-white font-bold text-[13px] shadow-sm shadow-emerald-600/20 hover:bg-emerald-500 active:bg-emerald-700 transition tabular-nums"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {formatPhone(lead.phone)}
                    </a>

                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="hidden sm:inline-flex items-center gap-1.5 text-gray-600 hover:text-emerald-700 text-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {lead.email}
                      </a>
                    )}

                    <span className="text-xs text-gray-500 truncate">
                      {LEAD_TYPE_LABELS[lead.type] || lead.type}
                      {lead.villageSlug ? ` · ${lead.villageSlug}` : ""}
                    </span>

                    {/* Status select */}
                    <div className="ml-auto flex items-center gap-2">
                      {isPending && <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        disabled={isPending}
                        className={`appearance-none px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ring-1 outline-none cursor-pointer disabled:opacity-50 ${
                          LEAD_STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-700 ring-gray-200"
                        }`}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {LEAD_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="bg-gray-50 px-4 sm:px-5 py-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-[13px]">
                        {/* Quiz answers (if quiz lead) */}
                        {quiz && (
                          <div className="lg:col-span-2 bg-white rounded-xl ring-1 ring-emerald-200 p-3">
                            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 mb-2">
                              Ответы на вопросы
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                              {Object.entries(quiz).map(([k, v]) => {
                                const h = humanizeAnswer(k, String(v));
                                return (
                                  <div key={k} className="bg-emerald-50 rounded-lg px-3 py-2">
                                    <div className="text-[10px] uppercase font-bold text-emerald-700/70 tracking-wider">
                                      {h.title}
                                    </div>
                                    <div className="text-sm font-bold text-emerald-900 mt-0.5">
                                      {h.label}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Raw message (if not quiz) */}
                        {!quiz && lead.message && (
                          <Field label="Сообщение" wide>
                            <pre className="whitespace-pre-wrap font-sans text-[13px] text-gray-800">
                              {lead.message}
                            </pre>
                          </Field>
                        )}

                        <Field label="Источник">
                          {LEAD_SOURCE_LABELS[lead.source] || lead.source}
                        </Field>
                        <Field label="Тип заявки">
                          {LEAD_TYPE_LABELS[lead.type] || lead.type}
                        </Field>

                        {lead.villageSlug && (
                          <Field label="Посёлок">{lead.villageSlug}</Field>
                        )}
                        {lead.plotNumber && (
                          <Field label="Участок №">{lead.plotNumber}</Field>
                        )}

                        {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
                          <Field label="UTM" wide>
                            {[lead.utmSource, lead.utmMedium, lead.utmCampaign]
                              .filter(Boolean)
                              .join(" / ")}
                          </Field>
                        )}

                        {lead.referer && (
                          <Field label="Откуда пришёл" wide>
                            <a
                              href={lead.referer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline break-all"
                            >
                              {lead.referer}
                            </a>
                          </Field>
                        )}

                        <Field label="ID">
                          <code className="text-[11px] text-gray-500">{lead.id}</code>
                        </Field>
                        <Field label="TG-доставка">
                          {lead.tgSent ? (
                            <span className="text-emerald-700">✓ доставлено</span>
                          ) : lead.tgError ? (
                            <span className="text-rose-700" title={lead.tgError}>✗ ошибка</span>
                          ) : (
                            <span className="text-gray-500">в очереди</span>
                          )}
                        </Field>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "lg:col-span-2" : ""}>
      <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
        {label}
      </div>
      <div className="text-gray-900">{children}</div>
    </div>
  );
}
