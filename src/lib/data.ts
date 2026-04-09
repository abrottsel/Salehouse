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

const Z = "http://zemexx.ru/upload/iblock";
const R = "http://zemexx.ru/upload/resize_cache/iblock";

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
      `${Z}/14e/hu6cot1wpnrosuzgm4jgeh2d1evnky0w/DJI_0316.jpg`,
      `${Z}/7ab/xmqdy3omq95m8o0wudnvytnxfyji3rrw/DJI_0314.jpg`,
      `${Z}/668/sb4ut43b879ay2r3ykrtqqyo5095zpw1/DJI_0318.jpg`,
      `${Z}/748/xfacugicd27uxzxx1fc0xe3lks1u43z6/DJI_0319.jpg`,
      `${Z}/dfc/0e6yfzxmxv3f6kmo6ak9wqudomukd03y/DJI_0325.jpg`,
      `${Z}/fab/n41nlwpttt4dja459hefzq020fo2xjm4/Favorit-na-sayt5.jpg`,
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
      `${Z}/573/sy6nl4j3q0rh0mbc8l3m7k4ztfn6e3pw/DJI_0350.jpg`,
      `${R}/d33/qsp4bk8gq4r54j7p3nj1cnu85se27zzm/1920_1080_240cd750bba9870f18aada2478b24840a/Zimniy-Lesnoy-Ostrov.jpg`,
      `${R}/9b7/fja2kdjdam4qd7jawl0qx6m0dctly404/1920_1080_240cd750bba9870f18aada2478b24840a/IMG_8275.JPG`,
      `${R}/ba7/q9nu4p37hn1b75fhsgoe1n9v2n9obcpu/1920_1080_240cd750bba9870f18aada2478b24840a/IMG_9751-kopiya.jpg`,
      `${R}/232/86x8rhk5ys7woid3sklxewuh9kzeaov2/1920_1080_240cd750bba9870f18aada2478b24840a/IMG_9758-kopiya.jpg`,
      `${R}/d49/tlccwnfyu7ryapz8112ac9dh07z2crfw/1920_1080_240cd750bba9870f18aada2478b24840a/IMG_9770-kopiya.jpg`,
      `${R}/b03/ym9vub30o5wq7b2i7uvp8b6z7fadp5g1/1920_1080_240cd750bba9870f18aada2478b24840a/IMG_9752-kopiya.jpg`,
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
      `${Z}/cc1/1jbid1yrl2w7ydlpkeyuy3cuv7vaehzf/DJI_0931.jpg`,
      `${Z}/fac/9q5mqpclj71hg1tm2wqp7kpl0axis563/DJI_0932.jpg`,
      `${R}/6fb/ydz437tffy7djcl3ju1f32rwumwayywx/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0929.jpg`,
      `${R}/55c/5v9bcich8cxc3l0h824op2kx3h4qu1hi/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0806-kopiya.jpg`,
      `${R}/2bc/62zrpgvlu865w0kkku20soi8eeryg1r3/1920_1080_240cd750bba9870f18aada2478b24840a/Bez-nazvaniya.png`,
      `${R}/f1a/p7aulzynrunis7q20gjh9rf3ay4o9s9y/1920_1080_240cd750bba9870f18aada2478b24840a/Bez-nazvaniya-_1_.png`,
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
      `${Z}/cab/eff0vp026mejxs4fu8yh9ziq2g0f2flt/prilesnoy.png`,
      `${Z}/700/0ajolc6ml8qao1fq97djle97kbvcekbj/PriLesnoy2.jpg`,
      `${Z}/c2a/2nxtf4bewbdxa8mdpk54xegu1diu15ju/photo_2026_04_01_17_45_46-_2_5.jpg`,
      `${R}/6d3/12kv81skr4q140ycxrx9fc1z337r6bi8/1920_1080_240cd750bba9870f18aada2478b24840a/dd1d7f5afb5b6bf871bcde57eb3ebe9f_c73c8b55_e501_4801_879b_77e5edc22c2b.png`,
      `${R}/2b3/x5ub3q5mdcvymd5rn2lbz2s1b9hg533b/1920_1080_240cd750bba9870f18aada2478b24840a/a80bc80a62bd623afaf8b4a435827d84_0fe75e72_48ee_4182_8d13_a9d608c13f0d.png`,
      `${R}/1f7/zaypidk7hl8c86l2qj9hbzzp6xodxsrr/1920_1080_240cd750bba9870f18aada2478b24840a/50f761404de1668d65d8e94b874907ed_02e4e3dc_b9d3_4e6f_b713_98e02c9e38f7.png`,
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
      `${Z}/ef6/344ztapfhvhoygmkm4d6saa7udlffrkl/DJI_0216.JPG`,
      `${R}/901/v2n5xcdq77s37px7e96evvq58z7elnpc/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0137.jpg`,
      `${Z}/17a/mphuykdx28a1sjplwi8a7qeb4wjjxspq/DJI_0219.JPG`,
      `${R}/d37/btuvc7u2x3znp556q75xzlc6xpg9eldw/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0214.JPG`,
      `${R}/3b0/5ldsuff6wzdw5wqglrxeldorpemhjns2/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0223.JPG`,
      `${Z}/265/tjp3c85dhhz6j1kcsz4vzq1443stpgfe/DJI_0231.JPG`,
      `${R}/b2d/3h083xyzhe42hg6s20z98bf0zimdkz7m/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0139.jpg`,
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
      `${R}/126/h9si3zg5q10onqnz9lkz4ssw5ggsdep3/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0817-kopiya.jpg`,
      `${R}/244/gbhpth8seea3v1d9bb7ao7suwi2z8jvj/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0816-kopiya.jpg`,
      `${R}/15d/xxfjcx0ydznpd5iv72mflvj7u1tbzj8g/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0818-kopiya.jpg`,
      `${R}/bdf/zvqzoclb6j1p0c1lxrtggwbm3rgza2g5/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0819-kopiya.jpg`,
      `${R}/23c/6oxd6go00oypdm3lrjxnbsg2o9tr0j3v/1920_1080_240cd750bba9870f18aada2478b24840a/DJI_0822-kopiya.jpg`,
      `${Z}/76f/yam1rg9wujpofejgkltw4rjcfhhzini8/DJI_0966.JPG`,
      `${R}/433/tcj2knh4kp47y13tdklfpk1i2arhw7r3/1920_1080_240cd750bba9870f18aada2478b24840a/Zimniy-SHishkino-Lend.jpg`,
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
      `${Z}/57b/45dvtf2zr0i5b44kzzfdwvl1rqtii23s/Triumfalnyy.png`,
      `${R}/039/l5822ecr9dxwhtmfriwf0901wcom9wgg/1920_1080_240cd750bba9870f18aada2478b24840a/Obvodka_novoe_felisovo_kopiya.jpg`,
      `${R}/8cf/k7zdqjffkt72o28oi5ask55to5l4e23a/1920_1080_240cd750bba9870f18aada2478b24840a/2cbae0fc10181836bda454356d7d3b2f_e5a5152e_7029_4459_890c_d2daa2cb5faf.png`,
      `${R}/d27/oaywiotjo5kekxa5d06pulh7eri3tyme/1920_1080_240cd750bba9870f18aada2478b24840a/a59307424b6034492e8615b0a776df44_70436936_aa37_41ef_b54d_521dc1ca06ea.png`,
      `${R}/388/nyw7p6knp29gq9p7d02pj36ioml95f4g/1920_1080_240cd750bba9870f18aada2478b24840a/995075a100c922b98672fd48a5957b87_7c961efb_7e1b_44b5_9c3b_9ef063c7decc.png`,
      `${R}/007/kllwknd6q8ngk8zboxnx23u5nm15ib8y/1920_1080_240cd750bba9870f18aada2478b24840a/aa271f511f457e45ba6caa481c882722_626a60ec_a78b_4737_a543_3975331a6859.png`,
      `${R}/fd3/qbzm03b85ixce3s0hlz2e51x6ll0rk1d/1920_1080_240cd750bba9870f18aada2478b24840a/df645fc8ee9073f764bb36dc9ed2ce40_37bd1a99_4fbc_44e0_ae9a_9227e81ca1fa.png`,
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
      `${R}/bde/lfjbvf3q4mpzth033037ajfqgxlkxuy1/1920_1080_240cd750bba9870f18aada2478b24840a/Riga-Les-kopiya.jpg`,
      `${R}/b8d/5nld7mm6whm5qgi448lrb2dq9uifxcdf/1920_1080_240cd750bba9870f18aada2478b24840a/Zimniy_RigaLes2.jpg`,
      `${R}/ea1/0mj7rl4u2zaobg13gcgstfqkdxmt5wao/1920_1080_240cd750bba9870f18aada2478b24840a/9eea33d0b2041762178264c914e47b91_b4760c8e_559c_4aca_923b_9ccf95054824.png`,
      `${R}/70b/wfd7p7sw9euwgv9z7ddzyj5n39siq0cj/1920_1080_240cd750bba9870f18aada2478b24840a/46296911583a728a4613cd4d4986d165_d42a8dba_9a1c_4e55_ae3e_db0e1f84a713.png`,
      `${R}/e34/nn1y15d1eizannx5uyj8k1zzu6anhyxg/1920_1080_240cd750bba9870f18aada2478b24840a/9b99ec47d5574c1a106f8638e7481114_8f0dab59_22f4_40f8_8d1e_01ace6dab987.png`,
      `${R}/042/tmdsu2k25p6bazjl4xw12m9fsh2hpstu/1920_1080_240cd750bba9870f18aada2478b24840a/0024b3933e853df33c878087f076c21e_b630423b_ebf3_4244_bc51_174f7e4f3635.png`,
      `${R}/582/x6aplfvgaikefuzkbesgg1sty2lm8idk/1920_1080_240cd750bba9870f18aada2478b24840a/b8b89f2612a3d9b25350a23d781c777f_535c409e_8f7c_41c1_a5cd_ed477b0c22cb.png`,
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
