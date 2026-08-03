import { ExternalLink, ShieldCheck } from "lucide-react";

/**
 * Раскрытие данных по карте Земекс — тёмный премиум.
 *
 * Требование юридическое: 152-ФЗ (передача ПДн партнёру) + ЗоЗПП (с кем
 * заключается договор бронирования). Текст перенесён дословно из боевого
 * src/components/IframeDisclosureBanner.tsx, меняется только оформление.
 * Выкидывать блок нельзя.
 *
 * В отличие от боевой версии баннер не прижат к рамке iframe, а стоит
 * отдельной плашкой над картой — PlotMapDark рисует свою скруглённую
 * рамку сам, и лезть внутрь него не нужно. Ссылка на оферту видна и на
 * мобильном (в боевой версии она там скрыта).
 */
export default function MapDisclosure() {
  return (
    <div className="mb-3 flex flex-col gap-3 rounded-[22px] bg-emerald-400/[0.07] p-4 ring-1 ring-emerald-400/20 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-emerald-400/12 ring-1 ring-emerald-400/25">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
        </div>
        <div className="min-w-0">
          <div className="text-[14px] font-bold leading-tight text-white">
            Онлайн-бронирование через сервис Zemexx
          </div>
          <div className="mt-1 text-[12.5px] leading-snug text-white/55">
            Карта участков и форма бронирования предоставлены партнёром. Данные передаются для
            обработки заявки.
          </div>
        </div>
      </div>

      <a
        href="/oferta"
        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 self-start rounded-full bg-white/[0.07] px-4 text-[12px] font-bold text-emerald-300 ring-1 ring-emerald-400/25 transition-colors hover:bg-white/[0.13] sm:self-auto"
      >
        Условия оферты
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
