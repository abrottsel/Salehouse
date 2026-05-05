import { NextResponse } from "next/server";
import { passwordMatches, setAuthCookie } from "@/lib/admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Brute-force shield: 5 wrong attempts → 10 min lockout per IP.
  // Без этого 8-символьный пароль перебирается за неделю.
  const ip = clientIp(req);
  const rl = rateLimit(ip, "admin-vpn-login", 5, 600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const pwd = typeof body.password === "string" ? body.password : "";
  if (!passwordMatches(pwd)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  await setAuthCookie();
  return NextResponse.json({ ok: true });
}
