import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.lead.deleteMany();
  await prisma.review.deleteMany();
  await prisma.plot.deleteMany();
  await prisma.village.deleteMany();

  // Create villages
  const favorit = await prisma.village.create({
    data: {
      name: "Фаворит",
      slug: "favorit",
      direction: "Каширское шоссе",
      distance: 30,
      readiness: 99,
      description: "Готовый коттеджный посёлок с полной инфраструктурой. Газ, электричество, асфальтированные дороги, охрана, детская площадка. Рядом хвойный лес и река.",
      features: ["Газ", "Электричество", "Асфальт", "Охрана", "Детская площадка", "Хвойный лес", "Река"],
    },
  });

  const lesnoyOstrov = await prisma.village.create({
    data: {
      name: "Лесной остров",
      slug: "lesnoy-ostrov",
      direction: "Каширское шоссе",
      distance: 36,
      readiness: 100,
      description: "Полностью готовый посёлок в окружении леса. Все коммуникации подведены, дороги с твёрдым покрытием, круглосуточная охрана.",
      features: ["Газ", "Электричество", "Асфальт", "Охрана", "Лес", "Все коммуникации"],
    },
  });

  const novoeSonino = await prisma.village.create({
    data: {
      name: "Новое Сонино",
      slug: "novoe-sonino",
      direction: "Симферопольское шоссе",
      distance: 37,
      readiness: 100,
      description: "Живописный посёлок у реки Злодейка в окружении векового леса.",
      features: ["Газ", "Электричество", "Асфальт", "Река", "Вековой лес", "Все коммуникации"],
    },
  });

  const prilesnoy = await prisma.village.create({
    data: {
      name: "ПриЛесной",
      slug: "prilesnoy",
      direction: "Дмитровское шоссе",
      distance: 27,
      readiness: 85,
      description: "Посёлок бизнес-класса на Дмитровском направлении.",
      features: ["Газ", "Электричество", "Асфальт", "Охрана", "Лес", "Близость к Москве"],
    },
  });

  const dachnayaPraktika = await prisma.village.create({
    data: {
      name: "Дачная Практика-2",
      slug: "dachnaya-praktika-2",
      direction: "Каширское шоссе",
      distance: 42,
      readiness: 100,
      description: "Готовый посёлок с ограждением и круглосуточной охраной.",
      features: ["Газ", "Электричество", "Асфальт", "Охрана", "Ограждение", "Все коммуникации"],
    },
  });

  const shishkinoLand = await prisma.village.create({
    data: {
      name: "Шишкино Лэнд",
      slug: "shishkino-land",
      direction: "Каширское шоссе",
      distance: 41,
      readiness: 60,
      description: "Посёлок с развитой инфраструктурой в пешей доступности.",
      features: ["Газ", "Электричество", "Асфальт", "Магазины", "Школы", "Спортплощадки"],
    },
  });

  const triumfalnyy = await prisma.village.create({
    data: {
      name: "Триумфальный",
      slug: "triumfalnyy",
      direction: "Дмитровское шоссе",
      distance: 28,
      readiness: 77,
      description: "Крупный посёлок на Дмитровском направлении.",
      features: ["Газ", "Электричество", "Асфальт", "Охрана", "Транспорт"],
    },
  });

  const rigales = await prisma.village.create({
    data: {
      name: "РигаЛес",
      slug: "rigales",
      direction: "Новорижское шоссе",
      distance: 45,
      readiness: 64,
      description: "Премиальный посёлок на Новорижском направлении в окружении леса.",
      features: ["Газ", "Электричество", "Асфальт", "Охрана", "Лес", "Премиум"],
    },
  });

  // Create plots for each village
  const villages = [
    { village: favorit, count: 12, pricePerSotka: 490000, areaMin: 6, areaMax: 12 },
    { village: lesnoyOstrov, count: 8, pricePerSotka: 625000, areaMin: 6, areaMax: 10 },
    { village: novoeSonino, count: 10, pricePerSotka: 355000, areaMin: 6, areaMax: 12 },
    { village: prilesnoy, count: 5, pricePerSotka: 1360000, areaMin: 8, areaMax: 15 },
    { village: dachnayaPraktika, count: 15, pricePerSotka: 400000, areaMin: 6, areaMax: 12 },
    { village: shishkinoLand, count: 32, pricePerSotka: 465000, areaMin: 6, areaMax: 10 },
    { village: triumfalnyy, count: 30, pricePerSotka: 1040000, areaMin: 6, areaMax: 12 },
    { village: rigales, count: 4, pricePerSotka: 1799000, areaMin: 10, areaMax: 20 },
  ];

  for (const v of villages) {
    for (let i = 1; i <= v.count; i++) {
      const area = v.areaMin + Math.random() * (v.areaMax - v.areaMin);
      const roundedArea = Math.round(area * 10) / 10;
      const price = Math.round(roundedArea * v.pricePerSotka);

      await prisma.plot.create({
        data: {
          villageId: v.village.id,
          number: `${v.village.slug.substring(0, 3).toUpperCase()}-${String(i).padStart(3, "0")}`,
          area: roundedArea,
          price,
          pricePerSotka: v.pricePerSotka,
          status: "AVAILABLE",
          category: "ИЖС",
          features: v.village.features?.slice(0, 4) || [],
        },
      });
    }
  }

  // Create reviews
  const reviewsData = [
    { name: "Алексей и Мария К.", text: "Купили участок в посёлке Фаворит год назад. Очень довольны выбором — тихое место, лес рядом, все коммуникации подведены.", rating: 5, villageId: favorit.id },
    { name: "Дмитрий С.", text: "Брал участок как инвестицию в Дачной Практике-2. За полтора года стоимость выросла на 30%. Сделка прошла быстро и прозрачно.", rating: 5, villageId: dachnayaPraktika.id },
    { name: "Елена В.", text: "Остановились на Новом Сонино — привлекла река и лес. Приезжаем каждые выходные, дорога отличная.", rating: 5, villageId: novoeSonino.id },
    { name: "Сергей и Ольга Т.", text: "Переехали в Лесной остров на ПМЖ. Газ, свет — всё есть. Охрана круглосуточная. Лучшее решение!", rating: 5, villageId: lesnoyOstrov.id },
    { name: "Игорь М.", text: "Покупал участок в Шишкино Лэнд. Рядом магазины и школа. Менеджеры помогли с оформлением. Рекомендую!", rating: 4, villageId: shishkinoLand.id },
  ];

  for (const review of reviewsData) {
    await prisma.review.create({ data: review });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
