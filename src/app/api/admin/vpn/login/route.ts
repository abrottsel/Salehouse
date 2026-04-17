import { NextResponse } from "next/server";
import { passwordMatches, setAuthCookie } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pwd = typeof body.password === "string" ? body.password : "";
  if (!passwordMatches(pwd)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  await setAuthCookie();
  return NextResponse.json({ ok: true });
}
