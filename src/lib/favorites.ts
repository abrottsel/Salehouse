/**
 * Favorites data shape — kept in localStorage.
 * Version 1 (v1). If we change the structure later, bump the key suffix.
 */

export const FAVORITES_STORAGE_KEY = "zemplus_favorites_v1";

export interface FavoriteVillage {
  type: "village";
  slug: string;
  addedAt: number;
}

export interface FavoritePlot {
  type: "plot";
  villageSlug: string;
  villageName: string;
  plotNumber: string;
  area: number;
  pricePerHundred: number;
  totalCost: number;
  status: string;
  addedAt: number;
}

export type Favorite = FavoriteVillage | FavoritePlot;

export interface FavoritesState {
  villages: FavoriteVillage[];
  plots: FavoritePlot[];
}

export const EMPTY_STATE: FavoritesState = { villages: [], plots: [] };

export function plotKey(villageSlug: string, plotNumber: string): string {
  return `${villageSlug}::${plotNumber}`;
}

export function readFavorites(): FavoritesState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<FavoritesState>;
    return {
      villages: Array.isArray(parsed.villages) ? parsed.villages : [],
      plots: Array.isArray(parsed.plots) ? parsed.plots : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function writeFavorites(state: FavoritesState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state));
    // Notify this tab (useEffect dependents) and other tabs (native event)
    window.dispatchEvent(
      new CustomEvent("zemplus:favorites-changed", { detail: state })
    );
  } catch {
    /* quota or private mode — ignore */
  }
}
