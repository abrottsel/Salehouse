import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import type { LeadType, LeadSource } from "@prisma/client";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Lead intake endpoint.
 *
 * Delivery guarantees (write-ahead style):
 *   1. POST body is validated (phone required, min 10 digits).
 *   2. Lead is written to Postgres FIRST — this is the source of truth.
 *      If the DB is unreachable we still fall through to (3) + (4) so
 *      the user sees a success response and we never drop a lead.
 *   3. A JSONL line is appended to /var/www/zemplus/logs/leads.jsonl so
 *      ops has a belt-and-braces file-based audit trail independent of
 *      Postgres.
 *   4. A Telegram notification is fired-and-forgotten. Failure to send
 *      updates the Lead row's tgError but does not affect the HTTP
 *      response.
 *
 * The response to the browser is always `{ success: true }` on a valid
 * phone, regardless of downstream delivery state. The back-office /admin
 * panel is the place to see delivery errors and retry.
 */

interface LeadInput {
  name?: string;
  phone?: string;
  email?: string;
  type?: string;
  message?: string;
  villageSlug?: string;
  villageId?: number | string; // legacy — accepted but ignored
  plotNumber?: string;
  plotId?: number | string;    // legacy — accepted but ignored
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

const LEAD_TYPE_LABELS: Record<string, string> = {
  VIEWING: "Просмотр участка",
  PRESENTATION: "Презентация",
  MORTGAGE: "Расчёт ипотеки",
  BOOKING: "Бронирование",
  CALLBACK: "Обратный звонок",
  HOUSE_CONSTRUCTION: "Строительство дома",
};

const VALID_LEAD_TYPES: LeadType[] = [
  "VIEWING",
  "PRESENTATION",
  "MORTGAGE",
  "BOOKING",
  "CALLBACK",
  "HOUSE_CONSTRUCTION",
];

function sanitize(s: unknown, maxLen = 500): string {
  if (typeof s !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\x00-\x1F\x7F]/g, "").slice(0, maxLen).trim();
}

function normalizeLeadType(raw: unknown): LeadType {
  const s = sanitize(raw, 50).toUpperCase();
  if ((VALID_LEAD_TYPES as string[]).includes(s)) return s as LeadType;
  return "CALLBACK";
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

async function appendToLogFile(record: Record<string, unknown>) {
  try {
    const logDir = process.env.LEADS_LOG_DIR || "/var/www/zemplus/logs";
    await fs.mkdir(logDir, { recursive: true });
    const line = JSON.stringify(record) + "\n";
    await fs.appendFile(path.join(logDir, "leads.jsonl"), line, "utf8");
  } catch (err) {
    console.error("leads: failed to write log", err);
  }
}

type LeadForTelegram = {
  id?: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  type?: string | null;
  message?: string | null;
  source?: string | null;
  villageSlug?: string | null;
  receivedAt?: string | null;
};

async function sendTelegram(lead: LeadForTelegram): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) {
    return { ok: false, error: "TG credentials not configured" };
  }

  const escapeHtml = (s: string) =>
    s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] ?? c));

  const name = String(lead.name || "");
  const phone = String(lead.phone || "—");
  const email = String(lead.email || "");
  const type = String(lead.type || "");
  const typeLabel = LEAD_TYPE_LABELS[type] || type || "—";
  const message = String(lead.message || "");
  const source = String(lead.source || "");
  const villageSlug = String(lead.villageSlug || "");
  const receivedAt = String(lead.receivedAt || "");

  const lines = [
    "🌿 <b>Новая заявка · ЗемПлюс</b>",
    "",
    `👤 <b>Имя:</b> ${name ? escapeHtml(name) : "<i>не указано</i>"}`,
    `📞 <b>Телефон:</b> <code>${escapeHtml(phone)}</code>`,
  ];
  if (email) lines.push(`✉️ <b>Email:</b> ${escapeHtml(email)}`);
  lines.push(`🏷 <b>Тип:</b> ${escapeHtml(typeLabel)}`);
  if (villageSlug) lines.push(`🏡 <b>Посёлок:</b> <code>${escapeHtml(villageSlug)}</code>`);
  if (message) lines.push(`💬 <b>Комментарий:</b>\n${escapeHtml(message)}`);
  if (source) lines.push(`🔗 <b>Источник:</b> ${escapeHtml(source)}`);
  if (lead.id) lines.push(`🆔 <code>${escapeHtml(lead.id)}</code>`);
  if (receivedAt) lines.push(`🕒 ${escapeHtml(receivedAt)}`);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const body = await res.text();
      const err = `telegram ${res.status}: ${body.slice(0, 200)}`;
      console.error("leads:", err);
      return { ok: false, error: err };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("leads: telegram send failed", msg);
    return { ok: false, error: `telegram fetch: ${msg}` };
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 leads / 10 min per IP. Spam-bot shield when Cloudflare
  // is disabled or the attacker targets the origin directly. Legit users
  // filling one form will never hit this.
  const ipForRL = clientIp(request);
  const rl = rateLimit(ipForRL, "leads", 5, 600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Слишком много заявок. Попробуйте через пару минут." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: LeadInput = {};
  try {
    body = (await request.json()) as LeadInput;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const phone = sanitize(body.phone, 30);
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Телефон обязателен" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");

  // Allow UTM parameters to arrive either in the JSON body or as URL
  // query params on the form's action URL — we accept both.
  const urlParams = new URL(request.url).searchParams;
  const utmSource = sanitize(body.utm_source || urlParams.get("utm_source"), 100);
  const utmMedium = sanitize(body.utm_medium || urlParams.get("utm_medium"), 100);
  const utmCampaign = sanitize(body.utm_campaign || urlParams.get("utm_campaign"), 100);

  const leadType = normalizeLeadType(body.type);
  const leadSource: LeadSource = "WEBSITE";

  const inputData = {
    name: sanitize(body.name, 100),
    phone,
    email: sanitize(body.email, 100) || null,
    message: sanitize(body.message, 2000) || null,
    type: leadType,
    source: leadSource,
    villageSlug: sanitize(body.villageSlug, 100) || null,
    plotNumber: sanitize(body.plotNumber, 50) || null,
    utmSource: utmSource || null,
    utmMedium: utmMedium || null,
    utmCampaign: utmCampaign || null,
    referer: referer || null,
    userAgent: userAgent || null,
    ipHash: hashIp(ip),
  };

  const receivedAt = new Date().toISOString();

  // ── 1. Write to Postgres (primary store) ──────────────────────────
  let leadId: string | null = null;
  let dbError: string | null = null;
  try {
    const created = await prisma.lead.create({ data: inputData });
    leadId = created.id;
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
    console.error("leads: db create failed — degrading to TG-only", dbError);
  }

  // ── 2. JSONL fallback log ─────────────────────────────────────────
  // Always append, even when the DB write succeeded — this is our
  // offline audit trail and costs almost nothing.
  await appendToLogFile({
    ...inputData,
    id: leadId,
    receivedAt,
    dbError,
  });

  // ── 3. Telegram notification ──────────────────────────────────────
  // Fire-and-forget — never block the HTTP response on a slow Telegram
  // API. If the DB write succeeded, we update the row with delivery
  // status in the background.
  void (async () => {
    const tgResult = await sendTelegram({
      id: leadId ?? undefined,
      name: inputData.name,
      phone: inputData.phone,
      email: inputData.email,
      type: inputData.type,
      message: inputData.message,
      source: inputData.source,
      villageSlug: inputData.villageSlug,
      receivedAt,
    });

    if (leadId && !dbError) {
      try {
        await prisma.lead.update({
          where: { id: leadId },
          data: tgResult.ok
            ? { tgSent: true, tgSentAt: new Date(), tgError: null }
            : { tgSent: false, tgError: tgResult.error ?? "unknown" },
        });
      } catch (err) {
        console.error("leads: failed to persist tg delivery status", err);
      }
    }
  })();

  return NextResponse.json(
    { success: true, id: leadId, dbStatus: dbError ? "degraded" : "ok" },
    { status: 201 },
  );
}
