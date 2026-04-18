"use client";

import HomeDistanceBadge from "./HomeDistanceBadge";

/**
 * IframeMapOverlay — anchors the «Дорога к мечте» badge to the
 * top-right corner of an iframe map. The badge & its dropdown stay
 * within the relative parent and don't overlap the legend on the left.
 */
export default function IframeMapOverlay({
  villageCoords,
  villageName,
}: {
  villageCoords: [number, number];
  villageName: string;
}) {
  return (
    <div data-frame-overlay className="absolute top-20 right-3 sm:top-14 z-30 flex flex-col items-end gap-2 max-w-[calc(100%-24px)]">
      <HomeDistanceBadge
        villageCoords={villageCoords}
        villageName={villageName}
        variant="frame"
      />
    </div>
  );
}
