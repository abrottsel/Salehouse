import { prisma } from "@/lib/db";
import { DEV_MOCK_LEADS } from "../_devMockLeads";
import LeadsClient from "./_LeadsClient";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  let initialLeads: Awaited<ReturnType<typeof loadLeads>> = [];
  let dbError: string | null = null;
  let usingMock = false;
  try {
    initialLeads = await loadLeads();
  } catch (err) {
    dbError = err instanceof Error ? err.message : "DB unavailable";
    console.error("[admin/leads] initial load failed", err);
    const allowMocks =
      process.env.NODE_ENV !== "production" ||
      process.env.ADMIN_ALLOW_MOCKS === "true";
    if (allowMocks) {
      initialLeads = DEV_MOCK_LEADS;
      usingMock = true;
      dbError = null;
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Лиды
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Все заявки с сайта. Тап по телефону — звонок с твоего мобильного.
        </p>
      </div>

      {dbError && (
        <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          База недоступна: {dbError}
        </div>
      )}
      {usingMock && (
        <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          ⚠️ Demo-данные (БД local-dev недоступна). На продакшене будут реальные лиды.
        </div>
      )}

      <LeadsClient initial={initialLeads} />
    </div>
  );
}

async function loadLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      name: true,
      phone: true,
      email: true,
      message: true,
      type: true,
      status: true,
      source: true,
      villageSlug: true,
      plotNumber: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      referer: true,
      tgSent: true,
      tgError: true,
    },
  });
}
