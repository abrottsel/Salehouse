"use client";

import { MapPin, Navigation } from "lucide-react";

interface Props {
  coords: [number, number];
  name: string;
}

export default function VillageMap({ coords, name }: Props) {
  const [lat, lon] = coords;
  const mapSrc = `https://yandex.ru/map-widget/v1/?ll=${lon},${lat}&z=14&pt=${lon},${lat},pm2gnm`;
  const routeUrl = `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-600" />
            {name} на карте
          </h2>
          <a
            href={routeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
          >
            <Navigation className="w-4 h-4" />
            Построить маршрут
          </a>
        </div>

        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
          <iframe
            src={mapSrc}
            width="100%"
            height="450"
            frameBorder="0"
            allowFullScreen
            className="w-full"
            title={`Карта посёлка ${name}`}
          />
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Координаты: {lat.toFixed(4)}, {lon.toFixed(4)}
        </p>
      </div>
    </section>
  );
}
