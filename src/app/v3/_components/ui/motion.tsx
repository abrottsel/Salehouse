"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useTier } from "../../_lib/perf";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Появление секции при скролле. На lite — короткий fade без сдвига
 * и без blur: на слабых телефонах именно blur съедает кадры.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const tier = useTier();
  const lite = tier === "lite";
  const [forced, setForced] = useState(false);

  // Страховка от скрытой вкладки: там браузер не выдаёт кадров, поэтому
  // ни IntersectionObserver, ни анимация не отработают — и контент,
  // стартующий с нулевой прозрачности, остался бы невидимым навсегда.
  // Проверяем именно document.hidden: на видимой вкладке ничего не
  // форсируем, чтобы не убить анимацию у нормального посетителя.
  useEffect(() => {
    const t = setTimeout(() => {
      if (document.hidden) setForced(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  if (forced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: lite ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration: lite ? 0.25 : 0.7, delay: lite ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Контейнер для гирлянды дочерних Stagger.Item. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function StaggerList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/**
 * Счётчик, доезжающий до значения.
 * Есть страховка таймером: в фоновой вкладке requestAnimationFrame не
 * вызывается вообще, и без неё число навсегда осталось бы нулём.
 */
export function Counter({
  to,
  duration = 1100,
  className = "",
  format = (n: number) => n.toLocaleString("ru-RU"),
}: {
  to: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const [value, setValue] = useState(0);
  const tier = useTier();

  useEffect(() => {
    if (tier === "lite") {
      const t = setTimeout(() => setValue(to), 0);
      return () => clearTimeout(t);
    }
    let raf = 0;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const fallback = setTimeout(() => setValue(to), duration * 2);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [to, duration, tier]);

  return <span className={`tabular-nums ${className}`}>{format(value)}</span>;
}
