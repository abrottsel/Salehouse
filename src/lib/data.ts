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

const Z = "https://zemexx.ru/upload/iblock";

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
      `${Z}/14e/DJI_0316.jpg`,
      `${Z}/7ab/DJI_0314.jpg`,
      `${Z}/668/DJI_0318.jpg`,
      `${Z}/748/DJI_0319.jpg`,
      `${Z}/dfc/DJI_0325.jpg`,
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
      `${Z}/573/DJI_0350.jpg`,
      `${Z}/d75/DJI_0343.jpg`,
      `${Z}/e06/DJI_0344.jpg`,
      `${Z}/563/DJI_0347.jpg`,
      `${Z}/0df/DJI_0351.jpg`,
      `${Z}/59f/Lesnoy-Ostrov_sayt_4.jpg`,
      `${Z}/d33/Zimniy-Lesnoy-Ostrov.jpg`,
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
      `${Z}/cc1/DJI_0931.jpg`,
      `${Z}/fac/DJI_0932.jpg`,
      `${Z}/6fb/DJI_0929.jpg`,
      `${Z}/55c/DJI_0806-kopiya.jpg`,
      `${Z}/322/DJI_0802-kopiya.jpg`,
      `${Z}/6e1/Novoe-Sonino_2.jpg`,
      `${Z}/86a/Zimnee-Novoe-Sonino.jpg`,
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
      `${Z}/0eb/DJI_0809.JPG`,
      `${Z}/1b3/DJI_0822.JPG`,
      `${Z}/a56/DJI_0805.JPG`,
      `${Z}/c65/DJI_20.jpg`,
      `${Z}/cac/DJI_0077_1_.jpg`,
      `${Z}/f20/DJI_0220.jpg`,
      `${Z}/a38/PriLesnoy-na-sayt.jpg`,
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
      `${Z}/ef6/DJI_0216.JPG`,
      `${Z}/901/DJI_0137.jpg`,
      `${Z}/17a/DJI_0219.JPG`,
      `${Z}/d37/DJI_0214.JPG`,
      `${Z}/3b0/DJI_0223.JPG`,
      `${Z}/265/DJI_0231.JPG`,
      `${Z}/fa5/Zimnyaya-Dachnaya-praktika-2.jpg`,
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
      `${Z}/126/DJI_0817-kopiya.jpg`,
      `${Z}/244/DJI_0816-kopiya.jpg`,
      `${Z}/15d/DJI_0818-kopiya.jpg`,
      `${Z}/bdf/DJI_0819-kopiya.jpg`,
      `${Z}/23c/DJI_0822-kopiya.jpg`,
      `${Z}/76f/DJI_0966.JPG`,
      `${Z}/433/Zimniy-SHishkino-Lend.jpg`,
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
      `${Z}/051/DJI_0074.jpg`,
      `${Z}/8b4/DJI_0852.jpg`,
      `${Z}/021/DJI_0895.jpg`,
      `${Z}/ae2/DJI_0254.jpg`,
      `${Z}/867/DJI_0260.jpg`,
      `${Z}/9f8/Triumfalnyy_8.jpg`,
      `${Z}/90c/Triumfalnyy.jpg`,
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
      `${Z}/bde/Riga-Les-kopiya.jpg`,
      `${Z}/c03/DJI_0562.jpg`,
      `${Z}/99c/DJI_0574.jpg`,
      `${Z}/069/DJI_0648.JPG`,
      `${Z}/2a1/DJI_0653.JPG`,
      `${Z}/cd2/DJI_0430.JPG`,
      `${Z}/b8d/Zimniy_RigaLes2.jpg`,
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
