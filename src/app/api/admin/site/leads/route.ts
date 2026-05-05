import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/site-admin-auth";
import type { LeadStatus, LeadType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES: LeadStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "QUALIFIED",
  "WON",
  "LOST",
  "TEST",
];

const VALID_TYPES: LeadType[] = [
  "VIEWING",
  "PRESENTATION",
  "MORTGAGE",
  "BOOKING",
  "CALLBACK",
  "HOUSE_CONSTRUCTION",
];

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const typeParam = url.searchParams.get("type");
  const villageParam = url.searchParams.get("village");
  const limitParam = parseInt(url.searchParams.get("limit") || "200", 10);
  const limit = Math.min(Math.max(limitParam, 1), 500);

  const where: {
    status?: LeadStatus;
    type?: LeadType;
    villageSlug?: string;
  } = {};
  if (statusParam && (VALID_STATUSES as string[]).includes(statusParam)) {
    where.status = statusParam as LeadStatus;
  }
  if (typeParam && (VALID_TYPES as string[]).includes(typeParam)) {
    where.type = typeParam as LeadType;
  }
  if (villageParam) {
    where.villageSlug = villageParam;
  }

  try {
    const [leads, totals] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
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
      }),
      prisma.lead.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      leads,
      totals: Object.fromEntries(
        totals.map((t) => [t.status, t._count._all]),
      ) as Record<string, number>,
    });
  } catch (err) {
    console.error("[admin/leads] GET failed", err);
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}
