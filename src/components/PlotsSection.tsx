"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import PlotMap from "@/components/PlotMap";
import PlotsList from "@/components/PlotsList";
import type { Plot } from "@/lib/data";

interface Props {
  plots: Plot[];
  villageName: string;
  priceFrom: number;
}

export default function PlotsSection({ plots, villageName, priceFrom }: Props) {
  const [view, setView] = useState<"map" | "list">("map");

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Участки в {villageName}
          </h2>

          {/* Tab Switcher */}
          <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setView("map")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "map"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Карта участков
            </button>
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
              Список участков
            </button>
          </div>
        </div>

        {view === "map" ? (
          <PlotMap plots={plots} villageName={villageName} />
        ) : (
          <PlotsList plots={plots} villageName={villageName} priceFrom={priceFrom} embedded />
        )}
      </div>
    </section>
  );
}
