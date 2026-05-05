"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminSiteLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/site/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || `Ошибка ${res.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Сбой сети");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 leading-tight">
              Админка ЗемПлюс
            </h1>
            <p className="text-xs text-gray-500">Только для администратора</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-700 mb-1">
              Пароль
            </span>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </label>

          {error && (
            <p className="text-sm text-rose-600 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy || !password}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm h-12 rounded-xl shadow-md shadow-emerald-600/20 transition"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        <p className="mt-5 text-[11px] text-gray-400 text-center">
          После 5 неверных попыток — таймаут на 10 мин.
        </p>
      </div>
    </div>
  );
}
