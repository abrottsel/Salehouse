export interface Village {
  id: number;
  name: string;
  slug: string;
  direction: string;
  distance: number;
  readiness: number;
  description: string;
  features: string[];
  priceFrom: number;
  plotsCount: number;
  plotsAvailable: number;
  areaFrom: number;
  areaTo: number;
  photos: string[];
  coords: [number, number];
  plots?: Plot[];
}

export interface Plot {
  id: number;
  number: string;
  area: number;
  price: number;
  status: "available" | "reserved" | "sold";
}

const U = "https://images.unsplash.com/photo";

export const villages: Village[] = [
  {
    id: 1,
    name: "Фаворит",
    slug: "favorit",
    direction: "Каширское шоссе",
    distance: 30,
    readiness: 99,
    description: "Готовый коттеджный посёлок с полной инфраструктурой. Газ, электричество, асфальтированные дороги, охрана, детская площадка. Рядом хвойный лес и река.",
    features: ["Газ", "Электричество", "Асфальт", "Охрана", "Детская площадка", "Хвойный лес", "Река"],
    priceFrom: 490000,
    plotsCount: 57,
    plotsAvailable: 12,
    areaFrom: 6,
    areaTo: 12,
    photos: [
      `${U}-1508193638397-1c4234db14d8?w=1200&h=800&fit=crop`,
      `${U}-1501785888108-acb900c898c8?w=1200&h=800&fit=crop`,
      `${U}-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop`,
      `${U}-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop`,
      `${U}-1504567961542-e24d9439a724?w=1200&h=800&fit=crop`,
      `${U}-1500382017468-9049fed747ef?w=1200&h=800&fit=crop`,
    ],
    coords: [55.3250, 37.8650],
    plots: [
      { id: 101, number: "12", area: 6, price: 490000, status: "available" },
      { id: 102, number: "15", area: 8, price: 490000, status: "available" },
      { id: 103, number: "23", area: 10, price: 485000, status: "reserved" },
      { id: 104, number: "31", area: 12, price: 480000, status: "available" },
      { id: 105, number: "44", area: 6, price: 495000, status: "sold" },
    ],
  },
  {
    id: 2,
    name: "Лесной остров",
    slug: "lesnoy-ostrov",
    direction: "Каширское шоссе",
    distance: 36,
    readiness: 100,
    description: "Полностью готовый посёлок в окружении леса. Все коммуникации подведены, дороги с твёрдым покрытием, круглосуточная охрана.",
    features: ["Газ", "Электричество", "Асфальт", "Охрана", "Лес", "Все коммуникации"],
    priceFrom: 625000,
    plotsCount: 57,
    plotsAvailable: 8,
    areaFrom: 6,
    areaTo: 10,
    photos: [
      `${U}-1448375240586-882707db888b?w=1200&h=800&fit=crop`,
      `${U}-1542273917363-3b1957f18ddb?w=1200&h=800&fit=crop`,
      `${U}-1473448912268-2022ce9509d8?w=1200&h=800&fit=crop`,
      `${U}-1425913397330-cf8af2ff40a1?w=1200&h=800&fit=crop`,
      `${U}-1440581572325-0bea30075d9d?w=1200&h=800&fit=crop`,
    ],
    coords: [55.2780, 37.8200],
    plots: [
      { id: 201, number: "5", area: 6, price: 625000, status: "available" },
      { id: 202, number: "18", area: 8, price: 620000, status: "available" },
      { id: 203, number: "27", area: 10, price: 615000, status: "reserved" },
    ],
  },
  {
    id: 3,
    name: "Новое Сонино",
    slug: "novoe-sonino",
    direction: "Симферопольское шоссе",
    distance: 37,
    readiness: 100,
    description: "Живописный посёлок у реки Злодейка в окружении векового леса. Полностью обеспечен коммуникациями.",
    features: ["Газ", "Электричество", "Асфальт", "Река", "Вековой лес", "Все коммуникации"],
    priceFrom: 355000,
    plotsCount: 33,
    plotsAvailable: 10,
    areaFrom: 6,
    areaTo: 12,
    photos: [
      `${U}-1504858700536-882c978a3464?w=1200&h=800&fit=crop`,
      `${U}-1433086966358-54859d0ed716?w=1200&h=800&fit=crop`,
      `${U}-1509316975850-ff9c5deb0cd9?w=1200&h=800&fit=crop`,
      `${U}-1476231682828-37e571bc172f?w=1200&h=800&fit=crop`,
      `${U}-1506744038136-46273834b3fb?w=1200&h=800&fit=crop`,
    ],
    coords: [55.2600, 37.7900],
    plots: [
      { id: 301, number: "3", area: 6, price: 360000, status: "available" },
      { id: 302, number: "11", area: 8, price: 355000, status: "available" },
      { id: 303, number: "19", area: 10, price: 350000, status: "available" },
      { id: 304, number: "25", area: 12, price: 345000, status: "reserved" },
    ],
  },
  {
    id: 4,
    name: "ПриЛесной",
    slug: "prilesnoy",
    direction: "Дмитровское шоссе",
    distance: 27,
    readiness: 85,
    description: "Посёлок бизнес-класса на Дмитровском направлении. Отличная транспортная доступность, рядом лес.",
    features: ["Газ", "Электричество", "Асфальт", "Охрана", "Лес", "Близость к Москве"],
    priceFrom: 1360000,
    plotsCount: 22,
    plotsAvailable: 5,
    areaFrom: 8,
    areaTo: 15,
    photos: [
      `${U}-1564013799919-ab6f00b49eca?w=1200&h=800&fit=crop`,
      `${U}-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop`,
      `${U}-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop`,
      `${U}-1592595896616-c37162298647?w=1200&h=800&fit=crop`,
      `${U}-1558618666248-be8b12e46f56?w=1200&h=800&fit=crop`,
    ],
    coords: [55.9800, 37.5600],
    plots: [
      { id: 401, number: "2", area: 8, price: 1360000, status: "available" },
      { id: 402, number: "7", area: 10, price: 1350000, status: "available" },
      { id: 403, number: "14", area: 15, price: 1340000, status: "reserved" },
    ],
  },
  {
    id: 5,
    name: "Дачная Практика-2",
    slug: "dachnaya-praktika-2",
    direction: "Каширское шоссе",
    distance: 42,
    readiness: 100,
    description: "Готовый посёлок с ограждением и круглосуточной охраной. Все коммуникации подведены к каждому участку.",
    features: ["Газ", "Электричество", "Асфальт", "Охрана", "Ограждение", "Все коммуникации"],
    priceFrom: 400000,
    plotsCount: 81,
    plotsAvailable: 15,
    areaFrom: 6,
    areaTo: 12,
    photos: [
      `${U}-1500076656116-558aceda6012?w=1200&h=800&fit=crop`,
      `${U}-1560448204771-d78856a2cae4?w=1200&h=800&fit=crop`,
      `${U}-1595880052405-c0b4eb7a1b9e?w=1200&h=800&fit=crop`,
      `${U}-1500530855697-b586d89ba3ee?w=1200&h=800&fit=crop`,
      `${U}-1523217582562-09d0def993a6?w=1200&h=800&fit=crop`,
      `${U}-1416331108676-a22ccb276e35?w=1200&h=800&fit=crop`,
    ],
    coords: [55.2200, 37.8100],
    plots: [
      { id: 501, number: "8", area: 6, price: 405000, status: "available" },
      { id: 502, number: "22", area: 8, price: 400000, status: "available" },
      { id: 503, number: "35", area: 10, price: 395000, status: "available" },
      { id: 504, number: "47", area: 12, price: 390000, status: "reserved" },
      { id: 505, number: "60", area: 6, price: 410000, status: "sold" },
    ],
  },
  {
    id: 6,
    name: "Шишкино Лэнд",
    slug: "shishkino-land",
    direction: "Каширское шоссе",
    distance: 41,
    readiness: 60,
    description: "Посёлок с развитой инфраструктурой: магазины, кафе, школы и спортивные объекты в пешей доступности.",
    features: ["Газ", "Электричество", "Асфальт", "Магазины", "Школы", "Спортплощадки"],
    priceFrom: 465000,
    plotsCount: 63,
    plotsAvailable: 32,
    areaFrom: 6,
    areaTo: 10,
    photos: [
      `${U}-1560185127-6ed189bf02f4?w=1200&h=800&fit=crop`,
      `${U}-1558036117312-39c55f083921?w=1200&h=800&fit=crop`,
      `${U}-1545324418740-3c5cfc96e76d?w=1200&h=800&fit=crop`,
      `${U}-1575517111478-7e6645f23c0f?w=1200&h=800&fit=crop`,
      `${U}-1519331379826-f10be5486c6f?w=1200&h=800&fit=crop`,
    ],
    coords: [55.2300, 37.7800],
    plots: [
      { id: 601, number: "4", area: 6, price: 470000, status: "available" },
      { id: 602, number: "16", area: 8, price: 465000, status: "available" },
      { id: 603, number: "28", area: 10, price: 460000, status: "available" },
    ],
  },
  {
    id: 7,
    name: "Триумфальный",
    slug: "triumfalnyy",
    direction: "Дмитровское шоссе",
    distance: 28,
    readiness: 77,
    description: "Крупный посёлок на Дмитровском направлении с удобной транспортной доступностью и развитой инфраструктурой.",
    features: ["Газ", "Электричество", "Асфальт", "Охрана", "Транспорт"],
    priceFrom: 1040000,
    plotsCount: 128,
    plotsAvailable: 30,
    areaFrom: 6,
    areaTo: 12,
    photos: [
      `${U}-1500382017468-9049fed747ef?w=1200&h=800&fit=crop`,
      `${U}-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop`,
      `${U}-1464822759023-22dced0e071c?w=1200&h=800&fit=crop`,
      `${U}-1500076656116-558aceda6012?w=1200&h=800&fit=crop`,
      `${U}-1530533718754-cc017afd9f84?w=1200&h=800&fit=crop`,
      `${U}-1560518883280-b36dcf3e0e25?w=1200&h=800&fit=crop`,
    ],
    coords: [55.9700, 37.5400],
    plots: [
      { id: 701, number: "10", area: 6, price: 1050000, status: "available" },
      { id: 702, number: "33", area: 8, price: 1040000, status: "available" },
      { id: 703, number: "55", area: 10, price: 1035000, status: "reserved" },
      { id: 704, number: "77", area: 12, price: 1030000, status: "available" },
    ],
  },
  {
    id: 8,
    name: "РигаЛес",
    slug: "rigales",
    direction: "Новорижское шоссе",
    distance: 45,
    readiness: 64,
    description: "Премиальный посёлок на Новорижском направлении в окружении леса. Престижная локация для загородной жизни.",
    features: ["Газ", "Электричество", "Асфальт", "Охрана", "Лес", "Премиум"],
    priceFrom: 1799000,
    plotsCount: 10,
    plotsAvailable: 4,
    areaFrom: 10,
    areaTo: 20,
    photos: [
      `${U}-1542361345395-5b8960706cee?w=1200&h=800&fit=crop`,
      `${U}-1476231682828-37e571bc172f?w=1200&h=800&fit=crop`,
      `${U}-1507041957456-9c348b946510?w=1200&h=800&fit=crop`,
      `${U}-1496587351464-f67a8bfa028e?w=1200&h=800&fit=crop`,
      `${U}-1551524559-8af4e6624178?w=1200&h=800&fit=crop`,
      `${U}-1513836279014-a89567a6e85b?w=1200&h=800&fit=crop`,
    ],
    coords: [55.8100, 36.9800],
    plots: [
      { id: 801, number: "1", area: 10, price: 1800000, status: "available" },
      { id: 802, number: "3", area: 15, price: 1799000, status: "available" },
      { id: 803, number: "6", area: 20, price: 1790000, status: "reserved" },
    ],
  },
];

export const reviews = [
  {
    id: 1,
    name: "Алексей и Мария К.",
    text: "Купили участок в посёлке Фаворит год назад. Сейчас уже заканчиваем строительство дома. Очень довольны выбором — тихое место, лес рядом, все коммуникации уже были подведены. Дети в восторге от природы!",
    rating: 5,
    village: "Фаворит",
  },
  {
    id: 2,
    name: "Дмитрий С.",
    text: "Брал участок как инвестицию в Дачной Практике-2 полтора года назад. За это время стоимость выросла на 30%. Все документы в порядке, сделка прошла быстро и прозрачно.",
    rating: 5,
    village: "Дачная Практика-2",
  },
  {
    id: 3,
    name: "Елена В.",
    text: "Долго выбирали посёлок для дачи. Остановились на Новом Сонино — привлекла река и лес. Не пожалели ни разу! Приезжаем каждые выходные, дорога отличная, 40 минут от дома.",
    rating: 5,
    village: "Новое Сонино",
  },
  {
    id: 4,
    name: "Сергей и Ольга Т.",
    text: "Переехали в Лесной остров на ПМЖ. Газ, свет — всё есть. Охрана работает круглосуточно, территория ухоженная. Соседи — молодые семьи, дети дружат. Лучшее решение в нашей жизни!",
    rating: 5,
    village: "Лесной остров",
  },
  {
    id: 5,
    name: "Игорь М.",
    text: "Покупал участок в Шишкино Лэнд. Понравилось, что рядом магазины и школа — не нужно далеко ездить. Помогли с оформлением, всё прошло гладко. Рекомендую!",
    rating: 4,
    village: "Шишкино Лэнд",
  },
];

export const steps = [
  {
    number: 1,
    title: "Консультация",
    description: "Свяжитесь с нами, расскажите о ваших пожеланиях. Мы подберём подходящие варианты участков.",
  },
  {
    number: 2,
    title: "Просмотр участка",
    description: "Организуем бесплатную экскурсию в посёлок. Покажем участок, инфраструктуру, ответим на все вопросы.",
  },
  {
    number: 3,
    title: "Бронирование",
    description: "Понравился участок? Забронируйте его, чтобы никто не перехватил. Бронь фиксирует цену.",
  },
  {
    number: 4,
    title: "Проверка документов",
    description: "Наши юристы подготовят полный пакет документов. Вы получите выписку из ЕГРН и все необходимые справки.",
  },
  {
    number: 5,
    title: "Оформление сделки",
    description: "Подписание договора, регистрация в Росреестре. Вы получаете свидетельство о собственности.",
  },
  {
    number: 6,
    title: "Ваш участок!",
    description: "Поздравляем! Вы — владелец земельного участка. Начинайте строить дом своей мечты.",
  },
];
