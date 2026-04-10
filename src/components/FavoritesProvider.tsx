"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  EMPTY_STATE,
  FAVORITES_STORAGE_KEY,
  type FavoritePlot,
  type FavoriteVillage,
  type FavoritesState,
  plotKey,
  readFavorites,
  writeFavorites,
} from "@/lib/favorites";

interface FavoritesContextValue {
  villages: FavoriteVillage[];
  plots: FavoritePlot[];
  count: number;
  villageCount: number;
  plotCount: number;
  hydrated: boolean;
  isVillageFav: (slug: string) => boolean;
  isPlotFav: (villageSlug: string, plotNumber: string) => boolean;
  toggleVillage: (slug: string) => void;
  togglePlot: (plot: Omit<FavoritePlot, "type" | "addedAt">) => void;
  removeVillage: (slug: string) => void;
  removePlot: (villageSlug: string, plotNumber: string) => void;
  clearAll: () => void;
}

const noop = () => {};

// Safe default — used when a component renders outside of FavoritesProvider
// (e.g. in unit tests). Reading state returns empty / false so the UI degrades
// gracefully and doesn't throw.
const NOOP_VALUE: FavoritesContextValue = {
  villages: [],
  plots: [],
  count: 0,
  villageCount: 0,
  plotCount: 0,
  hydrated: false,
  isVillageFav: () => false,
  isPlotFav: () => false,
  toggleVillage: noop,
  togglePlot: noop,
  removeVillage: noop,
  removePlot: noop,
  clearAll: noop,
};

const FavoritesContext = createContext<FavoritesContextValue>(NOOP_VALUE);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FavoritesState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    setState(readFavorites());
    setHydrated(true);
  }, []);

  // Listen to cross-tab and same-tab changes
  useEffect(() => {
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<FavoritesState>).detail;
      if (detail) setState(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY) {
        setState(readFavorites());
      }
    };
    window.addEventListener("zemplus:favorites-changed", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("zemplus:favorites-changed", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const persist = useCallback((next: FavoritesState) => {
    setState(next);
    writeFavorites(next);
  }, []);

  const isVillageFav = useCallback(
    (slug: string) => state.villages.some((v) => v.slug === slug),
    [state.villages]
  );

  const isPlotFav = useCallback(
    (villageSlug: string, plotNumber: string) =>
      state.plots.some(
        (p) => p.villageSlug === villageSlug && p.plotNumber === plotNumber
      ),
    [state.plots]
  );

  const toggleVillage = useCallback(
    (slug: string) => {
      const exists = state.villages.some((v) => v.slug === slug);
      const next: FavoritesState = exists
        ? {
            ...state,
            villages: state.villages.filter((v) => v.slug !== slug),
          }
        : {
            ...state,
            villages: [
              ...state.villages,
              { type: "village", slug, addedAt: Date.now() },
            ],
          };
      persist(next);
    },
    [state, persist]
  );

  const togglePlot = useCallback(
    (plot: Omit<FavoritePlot, "type" | "addedAt">) => {
      const key = plotKey(plot.villageSlug, plot.plotNumber);
      const exists = state.plots.some(
        (p) => plotKey(p.villageSlug, p.plotNumber) === key
      );
      const next: FavoritesState = exists
        ? {
            ...state,
            plots: state.plots.filter(
              (p) => plotKey(p.villageSlug, p.plotNumber) !== key
            ),
          }
        : {
            ...state,
            plots: [
              ...state.plots,
              { ...plot, type: "plot", addedAt: Date.now() },
            ],
          };
      persist(next);
    },
    [state, persist]
  );

  const removeVillage = useCallback(
    (slug: string) => {
      persist({
        ...state,
        villages: state.villages.filter((v) => v.slug !== slug),
      });
    },
    [state, persist]
  );

  const removePlot = useCallback(
    (villageSlug: string, plotNumber: string) => {
      const key = plotKey(villageSlug, plotNumber);
      persist({
        ...state,
        plots: state.plots.filter(
          (p) => plotKey(p.villageSlug, p.plotNumber) !== key
        ),
      });
    },
    [state, persist]
  );

  const clearAll = useCallback(() => {
    persist(EMPTY_STATE);
  }, [persist]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      villages: state.villages,
      plots: state.plots,
      villageCount: state.villages.length,
      plotCount: state.plots.length,
      count: state.villages.length + state.plots.length,
      hydrated,
      isVillageFav,
      isPlotFav,
      toggleVillage,
      togglePlot,
      removeVillage,
      removePlot,
      clearAll,
    }),
    [
      state,
      hydrated,
      isVillageFav,
      isPlotFav,
      toggleVillage,
      togglePlot,
      removeVillage,
      removePlot,
      clearAll,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  return useContext(FavoritesContext);
}
