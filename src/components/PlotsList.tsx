"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import type { Plot } from "@/lib/data";

interface Props {
  plots: Plot[];
  villageName: string;
  priceFrom: number;
}

type SortKey = "number" | "area" | "price";
type FilterStatus = "all" | "available" | "reserved";

const statusLabels: Record<string, string> = {
  available: "Свободен",
  reserved: "Забронирован",
  sold: "Продан",
};

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-amber-100 text-amber-700",
  sold: "bg-gray-100 text-gray-500",
};

export default function PlotsList({ plots, villageName, priceFrom }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [sortAsc, setSortAsc] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = plots.filter((p) => {
    if (filterStatus === "all") return true;
    return p.status === filterStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = sortKey === "number" ? parseInt(a.number) : a[sortKey];
    const valB = sortKey === "number" ? parseInt(b.number) : b[sortKey];
    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Участки в {villageName}
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "available", "reserved"] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === status
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-green-50 border border-gray-200"
              }`}
            >
              {status === "all" ? "Все" : status === "available" ? "Свободные" : "Забронированные"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort("number")}
                      className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-green-600"
                    >
                      Участок
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort("area")}
                      className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-green-600"
                    >
                      Площадь
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4">
                    <button
                      onClick={() => handleSort("price")}
                      className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-green-600"
                    >
                      Цена за сотку
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Стоимость
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((plot) => (
                  <tr
                    key={plot.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      № {plot.number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {plot.area} соток
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      {plot.price.toLocaleString("ru-RU")} &#8381;
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {(plot.price * plot.area).toLocaleString("ru-RU")} &#8381;
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[plot.status]
                        }`}
                      >
                        {statusLabels[plot.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Нет участков с выбранным фильтром
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
