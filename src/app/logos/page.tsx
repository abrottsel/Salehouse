export default function LogosPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16 px-4">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
        Выберите логотип ЗемПлюс
      </h1>
      <p className="text-center text-gray-500 mb-12">Каждый вариант показан на светлом и тёмном фоне</p>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* V1 — Круг */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-gray-400 mb-4">1 &middot; КРУГ</div>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">Зем</span>
            <span className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <rect x="4" y="10" width="16" height="4" rx="2" fill="white" />
                <rect x="10" y="4" width="4" height="16" rx="2" fill="white" />
              </svg>
            </span>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-1.5">
            <span className="text-2xl font-extrabold text-white tracking-tight">Зем</span>
            <span className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <rect x="4" y="10" width="16" height="4" rx="2" fill="white" />
                <rect x="10" y="4" width="4" height="16" rx="2" fill="white" />
              </svg>
            </span>
          </div>
        </div>

        {/* V2 — Квадрат + "плюс" */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-gray-400 mb-4">2 &middot; КВАДРАТ</div>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">Зем</span>
            <span className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <rect x="4" y="10" width="16" height="4" rx="2" fill="white" />
                <rect x="10" y="4" width="4" height="16" rx="2" fill="white" />
              </svg>
            </span>
            <span className="text-lg text-gray-400 font-light">плюс</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-1.5">
            <span className="text-2xl font-extrabold text-white tracking-tight">Зем</span>
            <span className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <rect x="4" y="10" width="16" height="4" rx="2" fill="white" />
                <rect x="10" y="4" width="4" height="16" rx="2" fill="white" />
              </svg>
            </span>
            <span className="text-sm text-gray-500 font-light">плюс</span>
          </div>
        </div>

        {/* V3 — Символ + полоска (текущий) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-green-500 relative">
          <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">ТЕКУЩИЙ</div>
          <div className="text-xs font-bold text-gray-400 mb-4">3 &middot; СИМВОЛ</div>
          <div className="flex items-baseline gap-0 mb-1">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">Зем</span>
            <span className="text-5xl font-black text-green-600 leading-none">+</span>
          </div>
          <div className="flex mb-4"><div className="h-1.5 w-16 bg-green-600 rounded-full" /><div className="h-1.5 w-8 bg-green-200 rounded-r-full" /></div>
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-baseline gap-0 mb-1">
              <span className="text-3xl font-extrabold text-white tracking-tight leading-none">Зем</span>
              <span className="text-4xl font-black text-green-400 leading-none">+</span>
            </div>
            <div className="flex"><div className="h-1 w-12 bg-green-500 rounded-full" /><div className="h-1 w-6 bg-green-500/30 rounded-r-full" /></div>
          </div>
        </div>

        {/* V4 — Бейдж */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-gray-400 mb-4">4 &middot; БЕЙДЖ</div>
          <div className="inline-flex items-baseline bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl px-5 py-2.5 mb-4">
            <span className="text-3xl font-extrabold text-white tracking-tight leading-none">Зем</span>
            <span className="text-4xl font-black text-green-200 leading-none">+</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="inline-flex items-baseline bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl px-4 py-2">
              <span className="text-2xl font-extrabold text-white tracking-tight leading-none">Зем</span>
              <span className="text-3xl font-black text-green-200 leading-none">+</span>
            </div>
          </div>
        </div>

        {/* V5 — НОВЫЙ: Земля-иконка */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-blue-500 mb-4">5 &middot; НОВЫЙ &middot; ЗЕМЛЯ</div>
          <div className="flex items-center gap-2 mb-4">
            {/* Иконка участка земли */}
            <div className="w-11 h-11 bg-green-600 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-green-800 rounded-t-[4px]" />
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 relative z-10">
                <rect x="4" y="10" width="16" height="4" rx="2" fill="white" />
                <rect x="10" y="4" width="4" height="16" rx="2" fill="white" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight block leading-tight">ЗемПлюс</span>
              <span className="text-[10px] text-gray-400 tracking-widest uppercase">Земельные участки</span>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-2">
            <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-green-700 rounded-t-[3px]" />
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 relative z-10">
                <rect x="4" y="10" width="16" height="4" rx="2" fill="white" />
                <rect x="10" y="4" width="4" height="16" rx="2" fill="white" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight block leading-tight">ЗемПлюс</span>
              <span className="text-[9px] text-gray-500 tracking-widest uppercase">Земельные участки</span>
            </div>
          </div>
        </div>

        {/* V6 — НОВЫЙ: Геопин */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-blue-500 mb-4">6 &middot; НОВЫЙ &middot; ГЕОПИН</div>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
              <svg viewBox="0 0 40 48" className="w-10 h-12" fill="none">
                <path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z" fill="#16a34a"/>
                <rect x="12" y="17" width="16" height="4" rx="2" fill="white"/>
                <rect x="18" y="11" width="4" height="16" rx="2" fill="white"/>
              </svg>
            </div>
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Зем<span className="text-green-600">+</span>
            </span>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-2">
            <svg viewBox="0 0 40 48" className="w-8 h-10" fill="none">
              <path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z" fill="#22c55e"/>
              <rect x="12" y="17" width="16" height="4" rx="2" fill="white"/>
              <rect x="18" y="11" width="4" height="16" rx="2" fill="white"/>
            </svg>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Зем<span className="text-green-400">+</span>
            </span>
          </div>
        </div>

        {/* V7 — НОВЫЙ: Щит */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-blue-500 mb-4">7 &middot; НОВЫЙ &middot; ЩИТ</div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="relative">
              <svg viewBox="0 0 40 44" className="w-10 h-11" fill="none">
                <path d="M20 0L0 8v14c0 11.1 8.5 21.4 20 24 11.5-2.6 20-12.9 20-24V8L20 0z" fill="#16a34a"/>
                <rect x="12" y="18" width="16" height="4" rx="2" fill="white"/>
                <rect x="18" y="12" width="4" height="16" rx="2" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">ЗемПлюс</div>
              <div className="text-[10px] text-green-600 font-semibold tracking-wider">НАДЁЖНАЯ ЗЕМЛЯ</div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-2.5">
            <svg viewBox="0 0 40 44" className="w-8 h-9" fill="none">
              <path d="M20 0L0 8v14c0 11.1 8.5 21.4 20 24 11.5-2.6 20-12.9 20-24V8L20 0z" fill="#22c55e"/>
              <rect x="12" y="18" width="16" height="4" rx="2" fill="white"/>
              <rect x="18" y="12" width="4" height="16" rx="2" fill="white"/>
            </svg>
            <div>
              <div className="text-xl font-extrabold text-white tracking-tight leading-tight">ЗемПлюс</div>
              <div className="text-[9px] text-green-400 font-semibold tracking-wider">НАДЁЖНАЯ ЗЕМЛЯ</div>
            </div>
          </div>
        </div>

        {/* V8 — НОВЫЙ: Листок */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-blue-500 mb-4">8 &middot; НОВЫЙ &middot; ПРИРОДА</div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center rotate-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 -rotate-3">
                <path d="M12 3c-4.5 0-9 3-9 9s4 9 9 9 9-3 9-9-4.5-9-9-9z" fill="none" stroke="white" strokeWidth="0"/>
                <path d="M17 7C13 7 8 10 7 17c2-1 5-2 7-2s4 .5 6 1c0-5-1.5-9-3-9z" fill="rgba(255,255,255,0.3)"/>
                <rect x="4" y="10" width="16" height="4" rx="2" fill="white"/>
                <rect x="10" y="4" width="4" height="16" rx="2" fill="white"/>
              </svg>
            </div>
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Зем<span className="text-green-600 font-black">+</span>
            </span>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center rotate-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 -rotate-3">
                <path d="M17 7C13 7 8 10 7 17c2-1 5-2 7-2s4 .5 6 1c0-5-1.5-9-3-9z" fill="rgba(255,255,255,0.3)"/>
                <rect x="4" y="10" width="16" height="4" rx="2" fill="white"/>
                <rect x="10" y="4" width="4" height="16" rx="2" fill="white"/>
              </svg>
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Зем<span className="text-green-400 font-black">+</span>
            </span>
          </div>
        </div>

        {/* V9 — НОВЫЙ: Двухцветный */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-blue-500 mb-4">9 &middot; НОВЫЙ &middot; ДВУХЦВЕТНЫЙ</div>
          <div className="flex items-baseline mb-4">
            <span className="text-4xl font-black text-green-700 tracking-tight leading-none">Зем</span>
            <span className="text-4xl font-black text-emerald-500 tracking-tight leading-none">Плюс</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-black text-green-400 tracking-tight leading-none">Зем</span>
              <span className="text-3xl font-black text-emerald-300 tracking-tight leading-none">Плюс</span>
            </div>
          </div>
        </div>

        {/* V10 — НОВЫЙ: Жирная рамка */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-blue-500 mb-4">10 &middot; НОВЫЙ &middot; РАМКА</div>
          <div className="inline-flex items-baseline border-3 border-green-600 rounded-xl px-4 py-2 mb-4" style={{borderWidth: '3px'}}>
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">Зем</span>
            <span className="text-4xl font-black text-green-600 leading-none ml-0.5">+</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="inline-flex items-baseline border-2 border-green-500 rounded-lg px-3 py-1.5">
              <span className="text-2xl font-extrabold text-white tracking-tight leading-none">Зем</span>
              <span className="text-3xl font-black text-green-400 leading-none ml-0.5">+</span>
            </div>
          </div>
        </div>

        {/* V11 — НОВЫЙ: Дом */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-blue-500 mb-4">11 &middot; НОВЫЙ &middot; ДОМ</div>
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 44 40" className="w-11 h-10" fill="none">
              {/* House shape */}
              <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#16a34a"/>
              {/* Plus in center */}
              <rect x="14" y="22" width="16" height="4" rx="2" fill="white"/>
              <rect x="20" y="16" width="4" height="16" rx="2" fill="white"/>
            </svg>
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              ЗемПлюс
            </span>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-2">
            <svg viewBox="0 0 44 40" className="w-9 h-8" fill="none">
              <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#22c55e"/>
              <rect x="14" y="22" width="16" height="4" rx="2" fill="white"/>
              <rect x="20" y="16" width="4" height="16" rx="2" fill="white"/>
            </svg>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              ЗемПлюс
            </span>
          </div>
        </div>

        {/* V12 — НОВЫЙ: Гексагон */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-xs font-bold text-blue-500 mb-4">12 &middot; НОВЫЙ &middot; ГЕКСАГОН</div>
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 44 48" className="w-11 h-12" fill="none">
              <path d="M22 0L44 12v24L22 48 0 36V12L22 0z" fill="#16a34a"/>
              <rect x="14" y="21" width="16" height="4" rx="2" fill="white"/>
              <rect x="20" y="15" width="4" height="16" rx="2" fill="white"/>
            </svg>
            <div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight block leading-tight">ЗемПлюс</span>
              <span className="text-[10px] text-green-600 font-bold tracking-wider">УЧАСТКИ В ПОДМОСКОВЬЕ</span>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-2">
            <svg viewBox="0 0 44 48" className="w-9 h-10" fill="none">
              <path d="M22 0L44 12v24L22 48 0 36V12L22 0z" fill="#22c55e"/>
              <rect x="14" y="21" width="16" height="4" rx="2" fill="white"/>
              <rect x="20" y="15" width="4" height="16" rx="2" fill="white"/>
            </svg>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight block leading-tight">ЗемПлюс</span>
              <span className="text-[9px] text-green-400 font-bold tracking-wider">УЧАСТКИ В ПОДМОСКОВЬЕ</span>
            </div>
          </div>
        </div>

      </div>

      <p className="text-center text-gray-400 mt-12 text-sm">
        Напишите номер варианта (1-12) в чат
      </p>
    </div>
  );
}
