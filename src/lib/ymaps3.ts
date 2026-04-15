/**
 * Yandex Maps JS API 3.0 loader — SSR-safe, idempotent singleton.
 *
 * The 3.0 runtime is CDN-delivered (not an NPM runtime package), so we
 * inject a <script> tag the first time the loader is called on the
 * client and resolve a promise once `window.ymaps3.ready` fires. All
 * subsequent calls reuse the same promise.
 *
 * Types come from the devDep `@yandex/ymaps3-types`, but the actual
 * runtime lives in `window.ymaps3` — we cast through `unknown` on the
 * window access to avoid fighting the type system.
 *
 * Usage:
 *   import { loadYmaps3 } from "@/lib/ymaps3";
 *   useEffect(() => {
 *     loadYmaps3().then(({ ymaps3, reactify }) => { ... });
 *   }, []);
 */

import type * as YMaps3Module from "@yandex/ymaps3-types";
import type { GenericReactify } from "@yandex/ymaps3-types/reactify";

// Expose a narrow window shape so TS lets us read `window.ymaps3`.
declare global {
  interface Window {
    ymaps3?: typeof YMaps3Module & {
      ready: Promise<void>;
      import: (moduleName: string) => Promise<unknown>;
    };
  }
}

export interface Ymaps3Bundle {
  ymaps3: typeof YMaps3Module;
  reactify: GenericReactify;
}

const SCRIPT_ID = "ymaps3-loader";
const API_KEY =
  process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_YMAPS_KEY ??
  "";

let loadPromise: Promise<Ymaps3Bundle> | null = null;

/**
 * Load Yandex Maps 3.0 + the official Reactify bridge. The result is
 * cached, so it's safe to call from multiple components on the same page.
 *
 * Throws (rejects) in three cases:
 *   1. Called on the server (no `window`).
 *   2. NEXT_PUBLIC_YANDEX_MAPS_API_KEY is missing at build time.
 *   3. The CDN script fails to load (network / tracker-blocker). The
 *      calling component should catch and render a fallback.
 */
export function loadYmaps3(): Promise<Ymaps3Bundle> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadYmaps3: not in a browser"));
  }
  if (!API_KEY) {
    return Promise.reject(
      new Error(
        "loadYmaps3: NEXT_PUBLIC_YANDEX_MAPS_API_KEY is not set — add it to .env.local on the server and redeploy",
      ),
    );
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<Ymaps3Bundle>((resolve, reject) => {
    // Happy path: the global is already there (e.g. after fast-refresh
    // in dev, or a prior mount in the same session).
    if (window.ymaps3 && window.ymaps3.ready) {
      window.ymaps3.ready
        .then(async () => {
          if (!window.ymaps3) throw new Error("ymaps3 vanished after ready");
          const reactifyMod = (await window.ymaps3.import(
            "@yandex/ymaps3-reactify",
          )) as unknown as { reactify: GenericReactify };
          resolve({
            ymaps3: window.ymaps3 as unknown as typeof YMaps3Module,
            reactify: reactifyMod.reactify,
          });
        })
        .catch(reject);
      return;
    }

    // Inject the CDN script once.
    const existing = document.getElementById(SCRIPT_ID) as
      | HTMLScriptElement
      | null;
    const script =
      existing ??
      Object.assign(document.createElement("script"), {
        id: SCRIPT_ID,
        src: `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(
          API_KEY,
        )}&lang=ru_RU`,
        async: true,
      });

    const onReady = async () => {
      try {
        if (!window.ymaps3) {
          throw new Error("ymaps3 global never appeared");
        }
        await window.ymaps3.ready;
        const reactifyMod = (await window.ymaps3.import(
          "@yandex/ymaps3-reactify",
        )) as unknown as { reactify: GenericReactify };
        resolve({
          ymaps3: window.ymaps3 as unknown as typeof YMaps3Module,
          reactify: reactifyMod.reactify,
        });
      } catch (err) {
        reject(err);
      }
    };

    const onError = () => {
      loadPromise = null; // allow retry after a failure
      reject(
        new Error(
          "ymaps3 CDN script failed to load — likely blocked by Safari Private or a strict tracker blocker",
        ),
      );
    };

    script.addEventListener("load", onReady);
    script.addEventListener("error", onError);

    if (!existing) {
      document.head.appendChild(script);
    } else if (window.ymaps3) {
      // Edge case: script tag exists AND the global is already set
      // (rare, but happens during RSC revalidation).
      onReady();
    }
  });

  return loadPromise;
}

/**
 * Wipe the cached promise. Only useful in tests or if you know the CDN
 * went down and you want the next mount to retry.
 */
export function resetYmaps3Loader(): void {
  loadPromise = null;
}
