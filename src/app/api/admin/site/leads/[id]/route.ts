import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/site-admin-auth";
import type { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES: LeadStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "QUALIFIED",
  "WON",
  "LOST",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const status = typeof body.status === "string" ? body.status : "";
  if (!(VALID_STATUSES as string[]).includes(status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  try {
    const updated = await prisma.lead.update({
      where: { id },
      data: { status: status as LeadStatus },
      select: { id: true, status: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, lead: updated });
  } catch (err) {
    console.error("[admin/leads/:id] PATCH failed", err);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
