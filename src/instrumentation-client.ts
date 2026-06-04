// Загружается Next.js на клиенте ДО гидратации (App Router).
// Подключаем полифиллы для старых Safari (iOS 15.x), чтобы React-рантайм
// не падал на отсутствующих методах. См. src/polyfills.ts.
import "./polyfills";
