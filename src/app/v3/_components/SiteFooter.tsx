import Link from "next/link";
import { LEGAL } from "@/lib/legal";

/**
 * Подвал /v3. Реквизиты, юридические ссылки и дисклеймер «не оферта» —
 * один в один по смыслу с боевым футером: /v3 готовится в замену проду,
 * терять обязательные блоки нельзя.
 */
export default function SiteFooter() {
  const year = 2026;

  return (
    <footer className="mt-24 border-t border-white/10 bg-[#080b0f]">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-[17px] font-extrabold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white">
                З
              </span>
              ЗемПлюс
            </div>
            <p className="mt-3 max-w-[42ch] text-[14px] leading-relaxed text-white/50">
              Земельные участки в коттеджных посёлках Подмосковья с газом,
              электричеством, дорогами и охраной.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`tel:${LEGAL.phoneRaw}`}
                className="rounded-full bg-white/[0.07] px-4 py-2 text-[13px] font-bold ring-1 ring-white/12 transition-colors hover:bg-white/[0.13]"
              >
                {LEGAL.phone}
              </a>
              <a
                href={`mailto:${LEGAL.email}`}
                className="rounded-full bg-white/[0.07] px-4 py-2 text-[13px] font-bold ring-1 ring-white/12 transition-colors hover:bg-white/[0.13]"
              >
                {LEGAL.email}
              </a>
            </div>
          </div>

          <nav aria-label="Разделы сайта">
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-widest text-white/40">
              Разделы
            </h3>
            <ul className="space-y-2 text-[14px]">
              {[
                { href: "/v3/catalog", label: "Каталог посёлков" },
                { href: "/v3/mortgage", label: "Ипотека и рассрочка" },
                { href: "/v3/how-to-buy", label: "Как купить" },
                { href: "/v3/faq", label: "Вопросы и ответы" },
                { href: "/v3/favorites", label: "Избранное" },
                { href: "/v3/contacts", label: "Контакты" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-widest text-white/40">
              Документы
            </h3>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link href="/privacy" className="text-white/60 transition-colors hover:text-white">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/oferta" className="text-white/60 transition-colors hover:text-white">
                  Публичная оферта
                </Link>
              </li>
            </ul>
            <address className="mt-5 space-y-1 text-[12px] not-italic leading-relaxed text-white/40">
              <div>{LEGAL.fullName}</div>
              <div>ИНН {LEGAL.inn}</div>
              <div>ОГРНИП {LEGAL.ogrn}</div>
              <div>{LEGAL.legalAddress}</div>
            </address>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-[12px] leading-relaxed text-white/35">
          <p>
            Информация на сайте носит справочный характер и не является публичной
            офертой (ст. 437 ГК РФ). Актуальные цены, площади и статусы участков
            уточняйте у менеджера.
          </p>
          <p className="mt-2">
            © {year} {LEGAL.brand} · {LEGAL.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
