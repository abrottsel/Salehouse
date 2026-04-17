"use client";

import { useEffect, useState } from "react";
import { Lock, Loader2, Pencil, Check, X, Wifi, WifiOff } from "lucide-react";

interface User {
  username: string;
  status: string;
  note: string | null;
  used_traffic: number;
  online_at: string | null;
  created_at: string;
}

export default function AdminVpnPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Try loading users — if 401, show login form
  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/vpn/users");
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users || []);
      setAuthenticated(true);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/vpn/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError("Неверный пароль");
        return;
      }
      await load();
    } catch {
      setLoginError("Ошибка подключения");
    } finally {
      setLoggingIn(false);
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user.username);
    setEditValue(user.note || "");
  };

  const saveEdit = async (username: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/vpn/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, note: editValue }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUsers((prev) =>
        prev.map((u) => (u.username === username ? { ...u, note: editValue } : u)),
      );
      setEditingUser(null);
    } catch (err) {
      alert("Ошибка: " + (err instanceof Error ? err.message : "unknown"));
    } finally {
      setSaving(false);
    }
  };

  // ── Login screen ──────────────────────────────────────────
  if (authenticated === false) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm p-8 rounded-3xl bg-white/5 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">VPN Админка</h1>
              <p className="text-xs text-white/50">Marzban управление</p>
            </div>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-white/30"
            autoFocus
          />
          {loginError && (
            <p className="mt-2 text-xs text-rose-400">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={loggingIn}
            className="mt-4 w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Войти"}
          </button>
        </form>
      </main>
    );
  }

  // ── Loading ──────────────────────────────────────────────
  if (authenticated === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </main>
    );
  }

  // ── Users table ──────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">VPN пользователи</h1>
            <p className="text-sm text-white/50 mt-1">
              Marzban · {users.length} юзеров
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="px-4 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Обновить"}
          </button>
        </div>

        {loadError && (
          <div className="p-4 mb-4 rounded-xl bg-rose-500/10 ring-1 ring-rose-500/20 text-rose-300 text-sm">
            {loadError}
          </div>
        )}

        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/5">
                <th className="px-4 py-3 text-left">Юзер</th>
                <th className="px-4 py-3 text-left">Статус</th>
                <th className="px-4 py-3 text-right">Трафик</th>
                <th className="px-4 py-3 text-left">Онлайн</th>
                <th className="px-4 py-3 text-left">Примечание</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const mb = Math.round(u.used_traffic / 1048576);
                const gb = (u.used_traffic / (1024 ** 3)).toFixed(2);
                const isOnline =
                  u.online_at &&
                  Date.now() - new Date(u.online_at).getTime() < 5 * 60_000;
                const isEditing = editingUser === u.username;
                return (
                  <tr
                    key={u.username}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-white">
                      {u.username}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-black uppercase ${
                          u.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-white/70 tabular-nums">
                      {mb >= 1024 ? `${gb} ГБ` : `${mb} МБ`}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <Wifi className="w-3 h-3" /> сейчас
                        </span>
                      ) : u.online_at ? (
                        <span className="inline-flex items-center gap-1 text-white/40">
                          <WifiOff className="w-3 h-3" />
                          {new Date(u.online_at).toLocaleDateString("ru-RU")}
                        </span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(u.username);
                              if (e.key === "Escape") setEditingUser(null);
                            }}
                            className="flex-1 h-8 px-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(u.username)}
                            disabled={saving}
                            className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center"
                          >
                            {saving ? (
                              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                          >
                            <X className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(u)}
                          className="group inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
                        >
                          <span className={u.note ? "" : "text-white/30 italic"}>
                            {u.note || "добавить…"}
                          </span>
                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-white/50" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-white/30 text-center">
          Данные с <code className="text-white/50">147.45.68.37:8000</code> · tap
          на примечание для редактирования
        </p>
      </div>
    </main>
  );
}
