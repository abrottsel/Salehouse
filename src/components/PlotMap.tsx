"use client";

import { useState } from "react";
import { X, Phone, MapPin, Maximize2 } from "lucide-react";
import type { Plot } from "@/lib/data";

interface Props {
  plots: Plot[];
  villageName: string;
}

const statusConfig = {
  available: {
    label: "Свободен",
    bg: "bg-green-100",
    border: "border-green-500",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  reserved: {
    label: "Забронирован",
    bg: "bg-amber-100",
    border: "border-amber-500",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  sold: {
    label: "Продан",
    bg: "bg-gray-200",
    border: "border-gray-400",
    text: "text-gray-500",
    dot: "bg-gray-400",
  },
};

export default function PlotMap({ plots, villageName }: Props) {
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

  const handlePlotClick = (plot: Plot) => {
    if (plot.status === "sold") return;
    setSelectedPlot(plot);
  };

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {(["available", "reserved", "sold"] as const).map((status) => {
          const cfg = statusConfig[status];
          return (
            <div key={status} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
              <span className="text-sm text-gray-600">{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Plot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {plots.map((plot) => {
          const cfg = statusConfig[plot.status];
          const isSold = plot.status === "sold";

          return (
            <button
              key={plot.id}
              onClick={() => handlePlotClick(plot)}
              disabled={isSold}
              className={`
                relative border-2 rounded-xl p-4 text-left transition-all
                ${cfg.bg} ${cfg.border}
                ${isSold ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg hover:scale-[1.02]"}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-lg font-bold ${cfg.text}`}>
                  № {plot.number}
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                >
                  {cfg.label}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Maximize2 className="w-3.5 h-3.5" />
                  {plot.area} соток
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {plot.price.toLocaleString("ru-RU")} &#8381;/сот.
                </div>
                <div className="text-xs text-gray-500">
                  Итого: {(plot.price * plot.area).toLocaleString("ru-RU")} &#8381;
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {selectedPlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedPlot(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPlot(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Участок № {selectedPlot.number}
            </h3>
            <p className="text-sm text-gray-500 mb-6">{villageName}</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Площадь</span>
                <span className="font-medium text-gray-900">
                  {selectedPlot.area} соток
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Цена за сотку</span>
                <span className="font-medium text-gray-900">
                  {selectedPlot.price.toLocaleString("ru-RU")} &#8381;
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Общая стоимость</span>
                <span className="font-bold text-green-600 text-lg">
                  {(selectedPlot.price * selectedPlot.area).toLocaleString("ru-RU")} &#8381;
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Статус</span>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selectedPlot.status].bg} ${statusConfig[selectedPlot.status].text}`}
                >
                  {statusConfig[selectedPlot.status].label}
                </span>
              </div>
            </div>

            {selectedPlot.status === "available" ? (
              <div className="space-y-3">
                <a
                  href="/#contacts"
                  className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Забронировать участок
                </a>
                <a
                  href="tel:+79859052555"
                  className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +7 (985) 905-25-55
                </a>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-amber-700 text-sm font-medium">
                  Этот участок уже забронирован
                </p>
                <a
                  href="tel:+79859052555"
                  className="inline-flex items-center gap-2 text-amber-600 text-sm mt-2 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Узнать о похожих участках
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
