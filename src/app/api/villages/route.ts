import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const villages = await prisma.village.findMany({
      include: {
        plots: {
          where: { status: "AVAILABLE" },
        },
      },
      orderBy: { distance: "asc" },
    });

    return NextResponse.json(villages);
  } catch (error) {
    console.error("Villages fetch error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
