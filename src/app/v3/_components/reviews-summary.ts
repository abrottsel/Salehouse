import { reviews } from "@/lib/data";

/**
 * Сводка по отзывам. Считается один раз из data.ts и используется и на
 * главной (строка доверия), и в разделе /v3/reviews — чтобы рейтинг
 * в двух местах не разъехался.
 */

export const REVIEWS_COUNT = reviews.length;

export const AVG_RATING = reviews.reduce((s, r) => s + r.rating, 0) / REVIEWS_COUNT;

/** «4.8» — для показа. Округление до десятых, как на витринах отзывов. */
export const AVG_RATING_LABEL = AVG_RATING.toFixed(1);

export const AVG_RATING_STARS = Math.round(AVG_RATING);
