import { NextResponse } from "next/server";
import { passwordMatches, setAuthCookie } from "@/lib/site-admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  // 5 wrong attempts → 10 min lockout per IP. Без этого 8-символьный
  // пароль перебирается за неделю.
  const ip = clientIp(req);
  const rl = rateLimit(ip, "admin-site-login", 5, 600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Слишком много попыток. Подождите несколько минут." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const pwd = typeof body.password === "string" ? body.password : "";
  if (!passwordMatches(pwd)) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  await setAuthCookie();
  return NextResponse.json({ ok: true });
}
