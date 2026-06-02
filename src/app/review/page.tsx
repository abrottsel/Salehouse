"use client";

/**
 * /review — стенд для согласования новой формы «Запись на просмотр».
 *
 * НЕ трогает прод-кнопки (шапка, hero посёлка, карточки участков) — это
 * изолированный предпросмотр по протоколу CLAUDE.md. После «да» от
 * пользователя реальные кнопки подключаются к openViewingForm() и
 * выкатываются отдельным релизом.
 *
 * Кнопки ниже имитируют три реальных места вызова формы и передают
 * соответствующий контекст (посёлок / участок).
 */

import ViewingModal, { openViewingForm } from "@/components/ViewingModal";
import { CalendarCheck } from "lucide-react";

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400 mb-2">
          Ревью · не прод
        </p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Форма «Запись на просмотр»
        </h1>
        <p className="text-white/70 mt-3 leading-relaxed">
          Новая отдельная форма записи на просмотр (модалка в стиле «Пушка»).
          Заявка падает боту <code className="text-emerald-300">@prozemplus_bot</code> (тип
          «Просмотр участка»). Можно отправить тестовую заявку — она реально уйдёт
          в Telegram. Прод-кнопки пока не тронуты.
        </p>

        <div className="mt-10 grid gap-5">
          {/* 1. Шапка — без контекста посёлка */}
          <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="font-bold text-lg">1. Кнопка в шапке сайта</h2>
            <p className="text-sm text-white/60 mt-1 mb-4">
              «Посмотреть вживую» — без привязки к посёлку. Сейчас ведёт на квиз;
              станет открывать эту форму.
            </p>
            <button
              type="button"
              onClick={() => openViewingForm({ source: "review-header" })}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition text-sm shadow-sm shadow-green-600/25"
            >
              Посмотреть вживую
            </button>
          </section>

          {/* 2. Hero посёлка — контекст посёлка */}
          <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="font-bold text-lg">2. Кнопка в посёлке (hero / карта)</h2>
            <p className="text-sm text-white/60 mt-1 mb-4">
              Бывшая «Запись на просмотр» → «Посмотреть вживую». Передаёт посёлок.
              Сейчас ведёт в никуда (мёртвый якорь <code>#contact-form</code>).
            </p>
            <button
              type="button"
              onClick={() =>
                openViewingForm({
                  villageSlug: "favorit",
                  villageName: "Фаворит",
                  source: "review-village-hero",
                })
              }
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition text-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              Посмотреть вживую
            </button>
          </section>

          {/* 3. Карточка участка — контекст посёлка + участок */}
          <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="font-bold text-lg">3. Карточка участка на карте</h2>
            <p className="text-sm text-white/60 mt-1 mb-4">
              Запись с конкретного участка — передаёт посёлок и номер участка.
            </p>
            <button
              type="button"
              onClick={() =>
                openViewingForm({
                  villageSlug: "favorit",
                  villageName: "Фаворит",
                  plotNumber: "12",
                  source: "review-plot-card",
                })
              }
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-400 transition text-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              Записаться · участок №12
            </button>
          </section>
        </div>

        <p className="text-xs text-white/40 mt-10">
          Если форма ок — скажите «да», подключу её к реальным кнопкам (шапка +
          посёлки + карточки участков) и выкачу на прод отдельным релизом.
        </p>
      </div>

      <ViewingModal />
    </main>
  );
}
