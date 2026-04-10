/**
 * Map data scraped from map.zemexx.ru/v2/api.php
 *
 * API endpoint pattern:
 *   http://map.zemexx.ru/v2/api.php?village_id={UUID}
 *
 * Known village UUIDs:
 *   - Каретный ряд: b89b431c-c28e-11ef-b3b6-005056a6b235
 *
 * The site uses Bitrix CMS with 1C integration. Village UUIDs follow
 * the format of 1C GUIDs. Other village UUIDs were not found in page
 * source; they may be discoverable via additional API endpoints or
 * the main zemexx.ru site's JavaScript.
 *
 * API Response Structure:
 * {
 *   village: { id, name, center: [lat, lon] },
 *   plots: [{ number, area, price_per_hundred, total_cost, status_name,
 *             coords: [[lat,lon],...], center: [lat,lon], kadastr,
 *             price_tier, utp, color, category }],
 *   village_coords: [[lat,lon],...],
 *   price_tiers: [number,...],
 *   statistics: { free, sold, reserved, other },
 *   cached_at: string
 * }
 *
 * Color scheme from the map JavaScript:
 *   free:     { fill: '#27ae60', stroke: '#1e8449', opacity: 0.18 }
 *   sold:     { fill: '#cccccc', stroke: '#aaaaaa', opacity: 0.04 }
 *   reserved: { fill: '#e67e22', stroke: '#d35400', opacity: 0.20 }
 */

export interface MapPlot {
  number: string;
  area: number;
  pricePerHundred: number;
  totalCost: number;
  statusName: string;
  coords: [number, number][];
  center: [number, number];
  kadastr: string;
  priceTier: number;
}

export interface MapVillageData {
  villageId: string;
  villageName: string;
  center: [number, number];
  villageCoords: [number, number][];
  priceTiers: number[];
  statistics: {
    free: number;
    sold: number;
    reserved: number;
    other: number;
  };
  plots: MapPlot[];
  cachedAt: string;
}

/**
 * Каретный ряд -- full plot data from map API
 * Fetched: 2026-04-10
 * Village ID: b89b431c-c28e-11ef-b3b6-005056a6b235
 *
 * Summary:
 * - 128 total plots
 * - 56 free, 46 sold, 0 reserved, 26 other/technical
 * - Price tiers: 950k, 998k, 1.055M, 1.149M, 1.22M per sotka
 * - Area range: ~6-12 sotok
 * - Kadastr prefix: 50:20:0080105
 */
export const karetnyRyadMapData: MapVillageData = {
  villageId: "b89b431c-c28e-11ef-b3b6-005056a6b235",
  villageName: "Каретный ряд",
  center: [55.7971766, 36.797646300000004],
  villageCoords: [
    [55.799252, 36.793763],
    [55.797906, 36.800127],
    [55.796687, 36.799314],
    [55.796605, 36.799498],
    [55.796299, 36.799498],
    [55.796283, 36.799454],
    [55.796263, 36.7994],
    [55.796192, 36.799316],
    [55.796166, 36.799296],
    [55.79613, 36.799066],
    [55.796007, 36.798954],
    [55.795793, 36.79668],
    [55.796892, 36.795673],
    [55.796967, 36.793625],
    [55.79593, 36.792513],
    [55.796317, 36.791858],
  ],
  priceTiers: [950000, 998000, 1055000, 1149000, 1220000],
  statistics: {
    free: 56,
    sold: 46,
    reserved: 0,
    other: 26,
  },
  plots: [
    // Sample plot (first from API response). Full dataset contains 128 plots.
    // The full data can be fetched at runtime from the API endpoint.
    {
      number: "117",
      area: 6.8,
      pricePerHundred: 950000,
      totalCost: 6460000,
      statusName: "Технический",
      coords: [
        [55.796956, 36.793916],
        [55.796943, 36.794274],
        [55.797214, 36.794305],
        [55.797227, 36.793947],
      ],
      center: [55.797085, 36.794111],
      kadastr: "50:20:0080105:477",
      priceTier: 0,
    },
  ],
  cachedAt: "2026-04-10 04:30:08",
};

/**
 * Map API configuration for fetching live data
 */
export const mapApiConfig = {
  baseUrl: "http://map.zemexx.ru/v2/api.php",
  knownVillages: {
    "karetnyy-ryad": "b89b431c-c28e-11ef-b3b6-005056a6b235",
    // Other village UUIDs to be discovered.
    // The map page at http://map.zemexx.ru/v2/index.php?village_id={UUID}
    // loads plot data via API call to ./api.php?village_id={UUID}
  },
  /**
   * Builds the API URL for a given village UUID
   */
  getApiUrl(villageId: string): string {
    return `${this.baseUrl}?village_id=${encodeURIComponent(villageId)}`;
  },
};

/**
 * Booking form endpoint discovered from map page source:
 * POST https://zemexx.ru/order/
 * Fields: village, plot_number, name, email, phone, comment
 */
export const bookingEndpoint = "https://zemexx.ru/order/";
