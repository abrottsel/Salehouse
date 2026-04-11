import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

/**
 * Lead intake endpoint.
 *
 * Что делает:
 *   1. Валидирует тело: phone обязателен.
 *   2. Пишет заявку в /var/www/zemplus/logs/leads.jsonl (append-only).
 *      Работает ВСЕГДА, даже если Telegram не настроен — заявки не теряются.
 *   3. Если задан TG_BOT_TOKEN + TG_CHAT_ID — шлёт уведомление в Telegram
 *      через Bot API. Не блокирует ответ клиенту при сбое Telegram —
 *      заявка в любом случае уже записана в файл.
 *
 * Как настроить Telegram:
 *   1. @BotFather → /newbot → получить токен TG_BOT_TOKEN
 *   2. Написать /start своему боту
 *   3. Открыть https://api.telegram.org/bot<TOKEN>/getUpdates — там в chat.id
 *      будет числовой ID → TG_CHAT_ID
 *   4. Добавить в /var/www/zemplus/.env.local:
 *        TG_BOT_TOKEN=123:abc
 *        TG_CHAT_ID=123456789
 *   5. pm2 reload zemplus --update-env
 */

interface LeadInput {
  name?: string;
  phone?: string;
  email?: string;
  type?: string;
  message?: string;
  villageId?: number | string;
  plotId?: number | string;
  source?: string;
}

const LEAD_TYPE_LABELS: Record<string, string> = {
  VIEWING: "Просмотр участка",
  PRESENTATION: "Презентация",
  MORTGAGE: "Расчёт ипотеки",
  BOOKING: "Бронирование",
  CALLBACK: "Обратный звонок",
};

function sanitize(s: unknown, maxLen = 500): string {
  if (typeof s !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\x00-\x1F\x7F]/g, "").slice(0, maxLen).trim();
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

async function sendTelegram(record: Record<string, unknown>) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) return;

  const escapeHtml = (s: string) =>
    s.replace(
      /[&<>]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] ?? c)
    );

  const name = String(record.name || "");
  const phone = String(record.phone || "—");
  const email = String(record.email || "");
  const type = String(record.type || "");
  const typeLabel = LEAD_TYPE_LABELS[type] || type || "—";
  const message = String(record.message || "");
  const source = String(record.source || "");
  const receivedAt = String(record.receivedAt || "");

  const lines = [
    "🌿 <b>Новая заявка · ЗемПлюс</b>",
    "",
    `👤 <b>Имя:</b> ${name ? escapeHtml(name) : "<i>не указано</i>"}`,
    `📞 <b>Телефон:</b> <code>${escapeHtml(phone)}</code>`,
  ];
  if (email) lines.push(`✉️ <b>Email:</b> ${escapeHtml(email)}`);
  lines.push(`🏷 <b>Тип:</b> ${escapeHtml(typeLabel)}`);
  if (message) lines.push(`💬 <b>Комментарий:</b>\n${escapeHtml(message)}`);
  if (source) lines.push(`🔗 <b>Источник:</b> ${escapeHtml(source)}`);
  if (receivedAt) lines.push(`🕒 ${escapeHtml(receivedAt)}`);

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      console.error("leads: telegram non-200", res.status, body.slice(0, 200));
    }
  } catch (err) {
    console.error("leads: telegram send failed", err);
  }
}

export async function POST(request: NextRequest) {
  let body: LeadInput = {};
  try {
    body = (await request.json()) as LeadInput;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const phone = sanitize(body.phone, 30);
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { error: "Телефон обязателен" },
      { status: 400 }
    );
  }

  const record = {
    receivedAt: new Date().toISOString(),
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null,
    userAgent: request.headers.get("user-agent") || null,
    referer: request.headers.get("referer") || null,
    name: sanitize(body.name, 100),
    phone,
    email: sanitize(body.email, 100),
    type: sanitize(body.type, 50) || "CALLBACK",
    message: sanitize(body.message, 2000),
    villageId: body.villageId ?? null,
    plotId: body.plotId ?? null,
    source: sanitize(body.source, 100),
  };

  // Always persist to file — не теряем заявки
  await appendToLogFile(record);

  // Fire-and-forget: не блокируем ответ, если TG тормозит
  sendTelegram(record).catch(() => {});

  return NextResponse.json({ success: true }, { status: 201 });
}
