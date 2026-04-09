"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  photos: string[];
  name: string;
}

export default function VillageGallery({ photos, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main photo */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden mb-4 bg-gray-100">
          <Image
            src={photos[activeIndex]}
            alt={`${name} — фото ${activeIndex + 1}`}
            fill
            className="object-cover"
            priority={activeIndex === 0}
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-20 h-14 sm:w-28 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-green-600 ring-2 ring-green-600/30"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={photo}
                alt={`${name} — миниатюра ${i + 1}`}
                fill
                className="object-cover"
                sizes="112px"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
