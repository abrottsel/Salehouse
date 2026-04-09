import { steps } from "@/lib/data";
import { CheckCircle2 } from "lucide-react";

export default function Steps() {
  return (
    <section id="steps" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Как купить участок
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Простой и прозрачный процесс покупки. От первого звонка до
            получения документов — мы рядом на каждом этапе.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
              {step.number === 6 && (
                <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-green-500" />
              )}
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-12 bg-white rounded-2xl p-8 lg:p-12 border border-green-100">
          <div className="lg:flex lg:items-center lg:gap-12">
            <div className="lg:flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Гарантия безопасности сделки
              </h3>
              <ul className="space-y-3">
                {[
                  "Все участки прошли юридическую проверку",
                  "Документы проверяет штатный юрист компании",
                  "Сделка регистрируется в Росреестре",
                  "Вы получаете полный пакет документов на руки",
                  "Гарантия юридической чистоты закреплена в договоре",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 lg:mt-0">
              <a
                href="#contacts"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Забронировать участок
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
