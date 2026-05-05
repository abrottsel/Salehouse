import Link from "next/link";
import { prisma } from "@/lib/db";
import { Inbox, Phone, Sparkles, ArrowRight } from "lucide-react";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS, formatPhone, formatDate } from "./_leadHelpers";
import { DEV_MOCK_LEADS } from "./_devMockLeads";

export const dynamic = "force-dynamic";

async function loadStats() {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [totals, todayCount, recent] = await Promise.all([
      prisma.lead.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.lead.count({ where: { createdAt: { gte: start } } }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          createdAt: true,
          name: true,
          phone: true,
          type: true,
          status: true,
          villageSlug: true,
        },
      }),
    ]);
    const byStatus = Object.fromEntries(
      totals.map((t) => [t.status, t._count._all]),
    ) as Record<string, number>;
    const total = totals.reduce((sum, t) => sum + t._count._all, 0);
    return { byStatus, todayCount, total, recent };
  } catch (err) {
    console.error("[admin/dashboard] db read failed", err);
    const allowMocks =
      process.env.NODE_ENV !== "production" ||
      process.env.ADMIN_ALLOW_MOCKS === "true";
    if (allowMocks) {
      // Dev-only: synthesize stats from mock leads
      const byStatus: Record<string, number> = {};
      DEV_MOCK_LEADS.forEach((l) => {
        byStatus[l.status] = (byStatus[l.status] || 0) + 1;
      });
      const startToday = new Date();
      startToday.setHours(0, 0, 0, 0);
      const todayCount = DEV_MOCK_LEADS.filter((l) => l.createdAt >= startToday).length;
      return {
        byStatus,
        todayCount,
        total: DEV_MOCK_LEADS.length,
        recent: DEV_MOCK_LEADS.slice(0, 8).map((l) => ({
          id: l.id,
          createdAt: l.createdAt,
          name: l.name,
          phone: l.phone,
          type: l.type,
          status: l.status,
          villageSlug: l.villageSlug,
        })),
      };
    }
    return null;
  }
}

export default async function AdminDashboardPage() {
  const data = await loadStats();

  if (!data) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5">
          <h2 className="font-bold text-rose-900">База недоступна</h2>
          <p className="text-sm text-rose-700 mt-1">
            Не удалось подключиться к Postgres. Проверь <code>DATABASE_URL</code> и состояние БД.
          </p>
        </div>
      </div>
    );
  }

  const { byStatus, todayCount, total, recent } = data;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Дашборд
        </h1>
        <p className="text-sm text-gray-500 mt-1">Сводка по заявкам с сайта.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Сегодня" value={todayCount} accent="emerald" />
        <StatCard label="Новые" value={byStatus.NEW || 0} accent="sky" />
        <StatCard label="В работе" value={byStatus.IN_PROGRESS || 0} accent="amber" />
        <StatCard label="Всего" value={total} accent="gray" />
      </div>

      {/* Recent */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Последние заявки
          </h2>
          <Link
            href="/admin/leads"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
          >
            Все лиды <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">
            <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            Заявок пока нет.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((lead) => (
              <li key={lead.id} className="px-5 py-3 flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                <span className="text-xs text-gray-400 tabular-nums w-32 sm:w-40 shrink-0">
                  {formatDate(lead.createdAt)}
                </span>
                <span className="font-bold text-gray-900 min-w-0 truncate">
                  {lead.name || <em className="text-gray-400">без имени</em>}
                </span>
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-mono text-[13px] tabular-nums"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {formatPhone(lead.phone)}
                </a>
                <span className="text-xs text-gray-500 truncate">
                  {LEAD_TYPE_LABELS[lead.type] || lead.type}
                  {lead.villageSlug ? ` · ${lead.villageSlug}` : ""}
                </span>
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                  {LEAD_STATUS_LABELS[lead.status] || lead.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "emerald" | "sky" | "amber" | "gray";
}) {
  const accentMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    gray: "bg-gray-50 text-gray-700 ring-gray-200",
  };
  return (
    <div className={`rounded-2xl ring-1 px-4 py-3 ${accentMap[accent]}`}>
      <div className="text-[11px] uppercase tracking-wider font-bold opacity-70">
        {label}
      </div>
      <div className="text-2xl sm:text-3xl font-black tabular-nums leading-tight mt-0.5">
        {value}
      </div>
    </div>
  );
}
