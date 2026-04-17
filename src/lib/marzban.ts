/**
 * Marzban API helper.
 *
 * Talks to a self-signed Marzban instance (TLS cert is self-issued,
 * so we need an https.Agent with rejectUnauthorized=false for Node fetch).
 */

import https from "node:https";

const MARZBAN_URL = process.env.MARZBAN_URL || "https://147.45.68.37:8000";
const MARZBAN_USER = process.env.MARZBAN_USER || "admin";
const MARZBAN_PASSWORD = process.env.MARZBAN_PASSWORD || "";

// Accept self-signed cert (Marzban default).
const agent = new https.Agent({ rejectUnauthorized: false });

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cached: CachedToken | null = null;

async function getToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }
  const res = await fetch(`${MARZBAN_URL}/api/admin/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: MARZBAN_USER,
      password: MARZBAN_PASSWORD,
    }),
    // @ts-expect-error Node fetch agent option
    agent,
  });
  if (!res.ok) throw new Error(`Marzban login failed: ${res.status}`);
  const data = await res.json();
  cached = {
    token: data.access_token,
    // Marzban tokens live ~24h; cache for 23h
    expiresAt: Date.now() + 23 * 3600 * 1000,
  };
  return cached.token;
}

export interface MarzbanUser {
  username: string;
  status: string;
  note: string | null;
  used_traffic: number; // bytes
  data_limit: number | null;
  expire: number | null;
  online_at: string | null;
  subscription_url: string;
  created_at: string;
}

export async function listUsers(): Promise<MarzbanUser[]> {
  const token = await getToken();
  const res = await fetch(`${MARZBAN_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
    // @ts-expect-error Node fetch agent option
    agent,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`listUsers: ${res.status}`);
  const data = await res.json();
  return (data.users || []).map((u: Record<string, unknown>) => ({
    username: String(u.username),
    status: String(u.status),
    note: (u.note as string | null) || null,
    used_traffic: Number(u.used_traffic || 0),
    data_limit: (u.data_limit as number | null) ?? null,
    expire: (u.expire as number | null) ?? null,
    online_at: (u.online_at as string | null) ?? null,
    subscription_url: String(u.subscription_url || ""),
    created_at: String(u.created_at || ""),
  }));
}

export async function updateUserNote(
  username: string,
  note: string,
): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${MARZBAN_URL}/api/user/${encodeURIComponent(username)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ note }),
    // @ts-expect-error Node fetch agent option
    agent,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`updateUserNote ${res.status}: ${text}`);
  }
}
