export default function LogosPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16 px-4">
      <h1 className="text-3xl font-bold text-center mb-12 text-gray-900">
        Сравнение логотипов
      </h1>

      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* НОВЫЙ — Зем [домик] Плюс */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-green-500 relative">
          <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">НОВЫЙ</div>
          <div className="text-xs font-bold text-gray-400 mb-6">ЗЕМ + ДОМИК + ПЛЮС</div>

          <div className="flex items-center gap-0.5 mb-6">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">Зем</span>
            <svg viewBox="0 0 44 40" className="w-12 h-11" fill="none">
              <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#16a34a" />
              <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
              <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
            </svg>
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">Плюс</span>
          </div>

          <div className="bg-gray-900 rounded-xl p-5 flex items-center gap-0.5">
            <span className="text-2xl font-extrabold text-white tracking-tight">Зем</span>
            <svg viewBox="0 0 44 40" className="w-10 h-9" fill="none">
              <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#22c55e" />
              <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
              <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
            </svg>
            <span className="text-2xl font-extrabold text-white tracking-tight">Плюс</span>
          </div>
        </div>

        {/* СТАРЫЙ — [домик] ЗемПлюс */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 relative">
          <div className="absolute -top-3 right-4 bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full">ТЕКУЩИЙ</div>
          <div className="text-xs font-bold text-gray-400 mb-6">ДОМИК + ЗЕМПЛЮС</div>

          <div className="flex items-center gap-2 mb-6">
            <svg viewBox="0 0 44 40" className="w-12 h-11" fill="none">
              <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#16a34a" />
              <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
              <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
            </svg>
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">ЗемПлюс</span>
          </div>

          <div className="bg-gray-900 rounded-xl p-5 flex items-center gap-2">
            <svg viewBox="0 0 44 40" className="w-10 h-9" fill="none">
              <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#22c55e" />
              <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
              <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
            </svg>
            <span className="text-2xl font-extrabold text-white tracking-tight">ЗемПлюс</span>
          </div>
        </div>

      </div>

      <p className="text-center text-gray-400 mt-12 text-sm">
        Напишите &laquo;новый&raquo; или &laquo;текущий&raquo;
      </p>
    </div>
  );
}
