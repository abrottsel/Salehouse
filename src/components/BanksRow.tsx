import { Landmark } from "lucide-react";

const banks = [
  { name: "ВТБ" },
  { name: "Сбер" },
  { name: "Альфа-Банк" },
  { name: "Газпромбанк" },
  { name: "Россельхозбанк" },
  { name: "Т-Банк" },
];

export default function BanksRow() {
  return (
    <section className="bg-white py-12 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-8">
          <Landmark className="w-4 h-4 text-green-600" />
          Работаем с ведущими банками по ипотеке
        </div>

        <div className="flex items-center justify-around gap-8 flex-wrap grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          {banks.map((bank) => (
            <div
              key={bank.name}
              className="text-xl sm:text-2xl font-black tracking-tighter text-gray-900 whitespace-nowrap"
            >
              {bank.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
