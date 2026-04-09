import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const villageId = searchParams.get("villageId");
    const status = searchParams.get("status");

    const plots = await prisma.plot.findMany({
      where: {
        ...(villageId ? { villageId: Number(villageId) } : {}),
        ...(status ? { status: status as "AVAILABLE" | "RESERVED" | "SOLD" } : {}),
      },
      include: {
        village: { select: { name: true, slug: true, direction: true } },
      },
      orderBy: { price: "asc" },
    });

    return NextResponse.json(plots);
  } catch (error) {
    console.error("Plots fetch error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
