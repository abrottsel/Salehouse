"use client";

/**
 * Подложка-заглушка вместо фрейма Земекс.
 *
 * Нужна только для просмотра дизайна там, где map.zemexx.ru недоступен
 * (например, с этой машины хост не резолвится). Геометрия участков —
 * условная, это не генплан. В боевом коде на этом месте живой iframe.
 */

type Status = "free" | "reserved" | "sold";

const FILL: Record<Status, string> = {
  free: "rgba(39,174,96,0.30)",
  reserved: "rgba(230,126,34,0.32)",
  sold: "rgba(190,190,190,0.14)",
};
const STROKE: Record<Status, string> = {
  free: "#27ae60",
  reserved: "#e67e22",
  sold: "#9aa0a6",
};

/** Сетка условных участков: 6 колонок × 4 ряда вдоль двух улиц. */
function buildPlots() {
  const out: { x: number; y: number; w: number; h: number; n: number; status: Status }[] = [];
  const pattern: Status[] = [
    "sold", "sold", "free", "reserved", "free", "sold",
    "sold", "free", "free", "free", "sold", "free",
    "free", "reserved", "sold", "free", "free", "sold",
    "sold", "free", "free", "sold", "reserved", "free",
  ];
  let n = 1;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
      const gapY = row < 2 ? 0 : 40; // проезд между рядами
      const gapX = col < 4 ? 0 : 34; // проезд между колоннами
      out.push({
        x: 70 + col * 92 + gapX,
        y: 74 + row * 108 + gapY,
        w: 80,
        h: 92,
        n: n,
        status: pattern[(n - 1) % pattern.length],
      });
      n++;
    }
  }
  return out;
}

const PLOTS = buildPlots();

export default function MockBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#10161d]">
      {/* Аэрофото посёлка как основа — читается как спутник под генпланом */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/villages/favorit/01.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-[#0b0e13]/45" />

      <svg
        viewBox="0 0 880 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {/* проезды */}
        <g stroke="rgba(255,255,255,0.22)" strokeWidth="18" strokeLinecap="round" fill="none">
          <path d="M40 330 H840" />
          <path d="M430 40 V660" />
        </g>

        {PLOTS.map((p) => (
          <g key={p.n}>
            <rect
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              rx="6"
              fill={FILL[p.status]}
              stroke={STROKE[p.status]}
              strokeWidth="1.5"
            />
            <text
              x={p.x + p.w / 2}
              y={p.y + p.h / 2 + 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="rgba(255,255,255,0.85)"
              style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.55)", strokeWidth: 3 }}
            >
              {p.n}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur-sm">
        подложка-заглушка · в боевом коде здесь фрейм Земекс
      </div>
    </div>
  );
}
