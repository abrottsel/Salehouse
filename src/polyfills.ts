/**
 * Полифиллы для старых Safari (iOS 15.x — iPhone 7/7+/8, SE1).
 *
 * Зачем: Next.js 16 «из коробки» таргетит Safari 16.4+ (см.
 * node_modules/next/dist/docs/03-architecture/supported-browsers.md).
 * На iOS 15 ряд рантайм-методов отсутствует, и их вызов во время
 * гидратации роняет весь React-рантайм → кнопки/onClick перестают
 * работать, ссылки (нативные) ещё живут. Это и наблюдалось на iPhone 7 Plus.
 *
 * Полифиллы — стандартный, спецификационно-корректный способ поддержать
 * старый браузер (НЕ костыль). На современных движках они не выполняются
 * (методы уже есть), поведение не меняется.
 *
 * Подключается из src/instrumentation-client.ts (загружается до гидратации).
 */

// Array.prototype.at / String.prototype.at — Safari 15.4+
function at(this: { length: number; [k: number]: unknown }, n: number) {
  const len = this.length;
  let i = Math.trunc(n) || 0;
  if (i < 0) i += len;
  if (i < 0 || i >= len) return undefined;
  return this[i];
}
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, "at", { value: at, writable: true, configurable: true });
}
if (!String.prototype.at) {
  Object.defineProperty(String.prototype, "at", { value: at, writable: true, configurable: true });
}
// TypedArray.prototype.at
const TypedArrayProto = Object.getPrototypeOf(Int8Array.prototype);
if (TypedArrayProto && !TypedArrayProto.at) {
  Object.defineProperty(TypedArrayProto, "at", { value: at, writable: true, configurable: true });
}

// Object.hasOwn — Safari 15.4+
if (!Object.hasOwn) {
  Object.defineProperty(Object, "hasOwn", {
    value: (obj: object, prop: PropertyKey) =>
      Object.prototype.hasOwnProperty.call(obj, prop),
    writable: true,
    configurable: true,
  });
}

// Array.prototype.findLast / findLastIndex — Safari 15.4+
if (!Array.prototype.findLast) {
  Object.defineProperty(Array.prototype, "findLast", {
    value: function (this: unknown[], cb: (v: unknown, i: number, a: unknown[]) => boolean, thisArg?: unknown) {
      for (let i = this.length - 1; i >= 0; i--) {
        if (cb.call(thisArg, this[i], i, this)) return this[i];
      }
      return undefined;
    },
    writable: true,
    configurable: true,
  });
}
if (!Array.prototype.findLastIndex) {
  Object.defineProperty(Array.prototype, "findLastIndex", {
    value: function (this: unknown[], cb: (v: unknown, i: number, a: unknown[]) => boolean, thisArg?: unknown) {
      for (let i = this.length - 1; i >= 0; i--) {
        if (cb.call(thisArg, this[i], i, this)) return i;
      }
      return -1;
    },
    writable: true,
    configurable: true,
  });
}

export {};
