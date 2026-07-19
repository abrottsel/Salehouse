const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.PROZEM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TG_CHAT_ID;          // Anton's personal chat (same 652477454)
const CHANNEL_ID = process.env.PROZEM_CHANNEL_ID || '-1003773945288'; // @prozemplus
const SITE_URL = process.env.SITE_URL || 'https://prozemplus.ru';

if (!TOKEN) {
  console.error('PROZEM_BOT_TOKEN is not set');
  process.exit(1);
}

// api.telegram.org недоступен с московского сервера (блокировка РФ) —
// TG_API_BASE указывает на SSH-туннель до релея на Париже.
const bot = new TelegramBot(TOKEN, {
  polling: true,
  baseApiUrl: process.env.TG_API_BASE || 'https://api.telegram.org',
});

// ---------------------------------------------------------------------------
// Village data
// ---------------------------------------------------------------------------
const villages = [
  { name: 'Фаворит', direction: 'Каширское шоссе', distance: 30, priceFrom: 490000, areaFrom: 6, areaTo: 20 },
  { name: 'Лесной Остров', direction: 'Каширское шоссе', distance: 36, priceFrom: 625000, areaFrom: 6, areaTo: 15 },
  { name: 'Новое Сонино', direction: 'Каширское шоссе', distance: 37, priceFrom: 355000, areaFrom: 6, areaTo: 25 },
  { name: 'Дачная Практика-2', direction: 'Каширское шоссе', distance: 42, priceFrom: 180000, areaFrom: 6, areaTo: 30 },
  { name: 'Каретный Ряд', direction: 'Дмитровское шоссе', distance: 42, priceFrom: 350000, areaFrom: 6, areaTo: 15 },
  { name: 'Триумфальный', direction: 'Дмитровское шоссе', distance: 48, priceFrom: 250000, areaFrom: 8, areaTo: 20 },
  { name: 'Сосновый Бор', direction: 'Новорижское шоссе', distance: 55, priceFrom: 450000, areaFrom: 8, areaTo: 25 },
  { name: 'Лесная Поляна', direction: 'Новорижское шоссе', distance: 60, priceFrom: 520000, areaFrom: 10, areaTo: 30 },
];

// ---------------------------------------------------------------------------
// Session store (in-memory, keyed by chatId)
// ---------------------------------------------------------------------------
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) sessions.set(chatId, {});
  return sessions.get(chatId);
}

function clearSession(chatId) {
  sessions.set(chatId, {});
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function userLabel(msg) {
  const u = msg.from || {};
  const parts = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown';
  const username = u.username ? ` (@${u.username})` : '';
  return `${parts}${username}`;
}

function timestamp() {
  return new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
}

function notifyAdmin(text) {
  if (ADMIN_CHAT_ID) {
    bot.sendMessage(ADMIN_CHAT_ID, text, { parse_mode: 'HTML' }).catch(() => {});
  }
}

function formatPrice(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ---------------------------------------------------------------------------
// Keyboard builders
// ---------------------------------------------------------------------------
function mainMenuKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '\u{1F3E1} Подобрать участок', callback_data: 'select_plot' },
          { text: '\u{1F4B0} Цены и рассрочка', callback_data: 'prices' },
        ],
        [
          { text: '\u{1F4CD} Посёлки и направления', callback_data: 'villages' },
          { text: '\u{1F3E6} Ипотека от 6.5%', callback_data: 'mortgage' },
        ],
        [
          { text: '\u{1F4CB} Как купить участок', callback_data: 'how_to_buy' },
          { text: '❓ Частые вопросы', callback_data: 'faq' },
        ],
        [
          { text: '✏️ Задать вопрос менеджеру', callback_data: 'write_question' },
        ],
      ],
    },
    parse_mode: 'HTML',
  };
}

// ---------------------------------------------------------------------------
// /start
// ---------------------------------------------------------------------------
bot.onText(/\/start/, (msg) => {
  clearSession(msg.chat.id);
  const text =
    '\u{1F44B} Привет! Я — ассистент <b>ПроЗемплюс</b>.\n' +
    'Помогу подобрать земельный участок в Подмосковье.\n\n' +
    '\u{1F4CD} 8 направлений от Москвы | \u{1F3E1} 31+ посёлок | \u{1F3E6} Ипотека от 6.5%\n\n' +
    'Выберите раздел или напишите свой вопрос:';
  bot.sendMessage(msg.chat.id, text, mainMenuKeyboard());
});

// ---------------------------------------------------------------------------
// /catalog
// ---------------------------------------------------------------------------
bot.onText(/\/catalog/, (msg) => {
  const chatId = msg.chat.id;
  clearSession(chatId);
  sendVillages(chatId);
});

// ---------------------------------------------------------------------------
// /prices
// ---------------------------------------------------------------------------
bot.onText(/\/prices/, (msg) => {
  clearSession(msg.chat.id);
  sendPrices(msg.chat.id);
});

// ---------------------------------------------------------------------------
// /mortgage
// ---------------------------------------------------------------------------
bot.onText(/\/mortgage/, (msg) => {
  clearSession(msg.chat.id);
  sendMortgage(msg.chat.id);
});

// ---------------------------------------------------------------------------
// /howtobuy
// ---------------------------------------------------------------------------
bot.onText(/\/howtobuy/, (msg) => {
  clearSession(msg.chat.id);
  sendHowToBuy(msg.chat.id);
});

// ---------------------------------------------------------------------------
// /contacts
// ---------------------------------------------------------------------------
bot.onText(/\/contacts/, (msg) => {
  clearSession(msg.chat.id);
  const text =
    '\u{1F4DE} <b>Контакты ПроЗемплюс</b>\n\n' +
    '\u{1F4DE} +7 (985) 905-25-55\n' +
    '\u{1F310} ' + SITE_URL + '\n' +
    '\u{1F4E7} info@prozemplus.ru\n\n' +
    '\u{1F4C5} Работаем: пн-сб 9:00–20:00\n' +
    '\u{1F697} Бесплатный выезд на просмотр';
  bot.sendMessage(msg.chat.id, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '\u{1F4DE} Записаться на просмотр', callback_data: 'book_viewing' }],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    },
  });
});

// ---------------------------------------------------------------------------
// Shared content functions
// ---------------------------------------------------------------------------
function sendVillages(chatId) {
  const text =
    '\u{1F4CD} <b>Наши посёлки в Подмосковье</b>\n\n' +
    '\u{1F697} <b>Каширское шоссе</b> (30–50 км от МКАД)\n' +
    'Фаворит, Лесной Остров, Новое Сонино, Дачная Практика-2 и др.\n\n' +
    '\u{1F697} <b>Дмитровское шоссе</b> (40–55 км)\n' +
    'Каретный Ряд, Триумфальный и др.\n\n' +
    '\u{1F697} <b>Новорижское шоссе</b> (45–70 км)\n' +
    'Премиальные посёлки с лесом\n\n' +
    'Всего 31 посёлок, 2800+ участков\n\n' +
    `\u{1F517} Полный каталог: ${SITE_URL}`;
  bot.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '\u{1F3E1} Подобрать участок', callback_data: 'select_plot' },
          { text: '\u{1F4DE} Записаться на просмотр', callback_data: 'book_viewing' },
        ],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    },
  });
}

function sendPrices(chatId) {
  const text =
    '\u{1F4B0} <b>Цены на участки ПроЗемплюс</b>\n\n' +
    '\u{1F4CA} Стоимость за сотку:\n' +
    '• Каширское шоссе — от 180 000 ₽\n' +
    '• Дмитровское шоссе — от 250 000 ₽\n' +
    '• Новорижское шоссе — от 350 000 ₽\n\n' +
    '\u{1F4B3} <b>Рассрочка:</b>\n' +
    '• До 12 месяцев без переплат\n' +
    '• Первый взнос — 30% от стоимости\n' +
    '• Без справок и одобрений\n\n' +
    '\u{1F3E6} Ипотека от 6.5% — нажмите кнопку ниже\n\n' +
    `\u{1F517} Все цены: ${SITE_URL}`;
  bot.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '\u{1F3E6} Подробнее об ипотеке', callback_data: 'mortgage' },
          { text: '\u{1F3E1} Подобрать участок', callback_data: 'select_plot' },
        ],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    },
  });
}

function sendMortgage(chatId) {
  const text =
    '\u{1F3E6} <b>Ипотека на земельный участок</b>\n\n' +
    'Работаем с 6 ведущими банками:\n\n' +
    '• ВТБ — от 6.5%\n' +
    '• Сбер — от 7.0%\n' +
    '• Альфа-Банк — от 6.9%\n' +
    '• Газпромбанк — от 7.2%\n' +
    '• Россельхозбанк — от 6.8%\n' +
    '• Т-Банк — от 7.5%\n\n' +
    '\u{1F4CB} <b>Что нужно:</b>\n' +
    '• Паспорт РФ\n' +
    '• Справка о доходах (или по форме банка)\n' +
    '• Первый взнос от 15%\n\n' +
    '⏱ Одобрение за 1–3 дня\n\n' +
    `\u{1F517} Калькулятор: ${SITE_URL}/#calculator`;
  bot.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '\u{1F4B0} Рассчитать платёж', url: `${SITE_URL}/#calculator` },
          { text: '\u{1F4DE} Консультация', callback_data: 'book_viewing' },
        ],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    },
  });
}

function sendHowToBuy(chatId) {
  const text =
    '\u{1F4CB} <b>6 шагов до вашего участка</b>\n\n' +
    '1️⃣ <b>Звонок или заявка</b> (5 мин)\n' +
    'Оставьте заявку — подберём варианты\n\n' +
    '2️⃣ <b>Бесплатный просмотр</b> (1–2 часа)\n' +
    'Покажем посёлки, инфраструктуру, участки\n\n' +
    '3️⃣ <b>Выбор участка</b>\n' +
    'Поможем выбрать лучший по цене и расположению\n\n' +
    '4️⃣ <b>Бронирование</b> (1 день)\n' +
    'Фиксируем цену, вносим минимальный залог\n\n' +
    '5️⃣ <b>Оформление документов</b> (5–7 дней)\n' +
    'Договор, проверка юр. чистоты, регистрация\n\n' +
    '6️⃣ <b>Получение выписки ЕГРН</b>\n' +
    'Участок ваш!\n\n' +
    '⚖️ 100% юридическая чистота по договору';
  bot.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '\u{1F4DE} Записаться на просмотр', callback_data: 'book_viewing' },
          { text: '\u{1F3E1} Подобрать участок', callback_data: 'select_plot' },
        ],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    },
  });
}

// ---------------------------------------------------------------------------
// Callback query handler
// ---------------------------------------------------------------------------
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const session = getSession(chatId);

  bot.answerCallbackQuery(query.id).catch(() => {});

  if (data === 'menu') {
    clearSession(chatId);
    const text =
      '\u{1F44B} Привет! Я — ассистент <b>ПроЗемплюс</b>.\n' +
      'Выберите раздел или напишите свой вопрос:';
    bot.sendMessage(chatId, text, mainMenuKeyboard());
    return;
  }

  if (data === 'villages') { clearSession(chatId); sendVillages(chatId); return; }
  if (data === 'prices')   { clearSession(chatId); sendPrices(chatId);   return; }
  if (data === 'mortgage') { clearSession(chatId); sendMortgage(chatId); return; }
  if (data === 'how_to_buy') { clearSession(chatId); sendHowToBuy(chatId); return; }

  // ==== SELECT PLOT FUNNEL ====
  if (data === 'select_plot') {
    session.funnel = { step: 'direction' };
    bot.sendMessage(chatId, '\u{1F697} Какое направление вас интересует?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Каширское шоссе', callback_data: 'dir_kashir' },
            { text: 'Дмитровское шоссе', callback_data: 'dir_dmitrov' },
          ],
          [
            { text: 'Новорижское шоссе', callback_data: 'dir_novorig' },
            { text: 'Любое направление', callback_data: 'dir_any' },
          ],
        ],
      },
    });
    return;
  }

  if (data.startsWith('dir_')) {
    const dirMap = {
      dir_kashir: 'Каширское шоссе',
      dir_dmitrov: 'Дмитровское шоссе',
      dir_novorig: 'Новорижское шоссе',
      dir_any: 'any',
    };
    session.funnel = session.funnel || {};
    session.funnel.direction = dirMap[data] || 'any';
    session.funnel.step = 'budget';
    bot.sendMessage(chatId, '\u{1F4B5} Какой бюджет за сотку?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'до 300 000 ₽', callback_data: 'price_300' },
            { text: '300–500 000 ₽', callback_data: 'price_500' },
          ],
          [
            { text: '500 000 – 1 млн ₽', callback_data: 'price_1m' },
            { text: 'от 1 млн ₽', callback_data: 'price_1m_plus' },
          ],
        ],
      },
    });
    return;
  }

  if (data.startsWith('price_')) {
    const budgetMap = {
      price_300: { min: 0, max: 300000 },
      price_500: { min: 300000, max: 500000 },
      price_1m: { min: 500000, max: 1000000 },
      price_1m_plus: { min: 1000000, max: Infinity },
    };
    session.funnel = session.funnel || {};
    session.funnel.budget = budgetMap[data] || { min: 0, max: Infinity };
    session.funnel.step = 'area';
    bot.sendMessage(chatId, '\u{1F4D0} Какая площадь участка?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '6–8 соток', callback_data: 'area_6_8' },
            { text: '8–12 соток', callback_data: 'area_8_12' },
          ],
          [
            { text: '12–20 соток', callback_data: 'area_12_20' },
            { text: 'от 20 соток', callback_data: 'area_20_plus' },
          ],
        ],
      },
    });
    return;
  }

  if (data.startsWith('area_')) {
    const areaMap = {
      area_6_8: { min: 6, max: 8 },
      area_8_12: { min: 8, max: 12 },
      area_12_20: { min: 12, max: 20 },
      area_20_plus: { min: 20, max: 100 },
    };
    const area = areaMap[data] || { min: 6, max: 100 };
    session.funnel = session.funnel || {};
    const { direction, budget } = session.funnel;
    const budgetRange = budget || { min: 0, max: Infinity };

    let results = villages.filter((v) => {
      if (direction && direction !== 'any' && v.direction !== direction) return false;
      if (v.priceFrom > budgetRange.max) return false;
      if (budgetRange.min > 0 && v.priceFrom < budgetRange.min * 0.5) return false;
      if (v.areaTo < area.min) return false;
      if (v.areaFrom > area.max) return false;
      return true;
    });

    if (results.length === 0) {
      results = villages.filter(
        (v) => !direction || direction === 'any' || v.direction === direction,
      );
    }

    results = results.slice(0, 3);

    if (results.length === 0) {
      bot.sendMessage(
        chatId,
        'К сожалению, точных совпадений нет. Наш менеджер поможет подобрать вариант!\n\n\u{1F4DE} Записаться на просмотр?',
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Да', callback_data: 'book_yes' },
                { text: '◀️ Вернуться в меню', callback_data: 'menu' },
              ],
            ],
          },
        },
      );
      return;
    }

    let text = '\u{1F3E1} Подходящие посёлки:\n\n';
    results.forEach((v, i) => {
      text += `${i + 1}. <b>${v.name}</b>\n`;
      text += `   \u{1F697} ${v.direction}, ${v.distance} км от МКАД\n`;
      text += `   \u{1F4B0} от ${formatPrice(v.priceFrom)} ₽/сотка\n`;
      text += `   \u{1F4D0} ${v.areaFrom}–${v.areaTo} соток\n\n`;
    });
    text += `\u{1F517} Все посёлки: ${SITE_URL}\n\n\u{1F4DE} Записаться на бесплатный просмотр?`;

    bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Записаться на просмотр', callback_data: 'book_yes' },
            { text: '◀️ Главное меню', callback_data: 'menu' },
          ],
        ],
      },
    });
    return;
  }

  // ==== BOOKING FLOW ====
  if (data === 'book_yes' || data === 'book_viewing') {
    session.booking = { step: 'name' };
    session.funnel = null;
    bot.sendMessage(chatId, '\u{1F4DD} Как вас зовут?');
    return;
  }

  // ==== FAQ ====
  if (data === 'faq') {
    clearSession(chatId);
    bot.sendMessage(chatId, '❓ <b>Частые вопросы</b>\n\nВыберите интересующий:', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Какая категория земли?', callback_data: 'faq_category' }],
          [{ text: 'Можно ли прописаться?', callback_data: 'faq_propiska' }],
          [{ text: 'Есть ли коммуникации?', callback_data: 'faq_comm' }],
          [{ text: 'Какие документы нужны?', callback_data: 'faq_docs' }],
          [{ text: 'Есть ли рассрочка?', callback_data: 'faq_rassrochka' }],
          [{ text: '◀️ Главное меню', callback_data: 'menu' }],
        ],
      },
    });
    return;
  }

  if (data === 'faq_category') {
    bot.sendMessage(chatId,
      '\u{1F3E0} <b>Категория земли</b>\n\nВсе наши участки — ИЖС. Можно строить дом, прописаться, подключить газ и свет.',
      { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◀️ К вопросам', callback_data: 'faq' }]] } },
    ); return;
  }
  if (data === 'faq_propiska') {
    bot.sendMessage(chatId,
      '\u{1F4DD} <b>Прописка</b>\n\nДа! На ИЖС можно оформить постоянную регистрацию после постройки жилого дома.',
      { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◀️ К вопросам', callback_data: 'faq' }]] } },
    ); return;
  }
  if (data === 'faq_comm') {
    bot.sendMessage(chatId,
      '\u{1F527} <b>Коммуникации</b>\n\nВ готовых посёлках: ✅ Газ ✅ Электричество ✅ Асфальт ✅ Охрана.\nВода — скважина (помогаем с бурением).',
      { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◀️ К вопросам', callback_data: 'faq' }]] } },
    ); return;
  }
  if (data === 'faq_docs') {
    bot.sendMessage(chatId,
      '\u{1F4C4} <b>Документы</b>\n\nДля покупки нужен только паспорт РФ. Мы готовим договор, акт, подаём в Росреестр.',
      { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◀️ К вопросам', callback_data: 'faq' }]] } },
    ); return;
  }
  if (data === 'faq_rassrochka') {
    bot.sendMessage(chatId,
      '\u{1F4B3} <b>Рассрочка</b>\n\nДо 12 месяцев без переплат. Первый взнос 30%. Без справок и банковских одобрений.',
      { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◀️ К вопросам', callback_data: 'faq' }]] } },
    ); return;
  }

  // ==== WRITE QUESTION ====
  if (data === 'write_question') {
    session.mode = 'write_question';
    bot.sendMessage(chatId,
      '✏️ Напишите ваш вопрос — передам менеджеру, ответим в ближайшее время.\n\nИли позвоните: +7 (985) 905-25-55',
    );
    return;
  }
});

// ---------------------------------------------------------------------------
// Text message handler (booking flow + write-question mode + unrecognized)
// ---------------------------------------------------------------------------
bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const session = getSession(chatId);
  const text = msg.text.trim();

  if (session.booking && session.booking.step === 'name') {
    session.booking.name = text;
    session.booking.step = 'phone';
    bot.sendMessage(chatId, '\u{1F4DE} Ваш номер телефона?');
    return;
  }

  if (session.booking && session.booking.step === 'phone') {
    session.booking.phone = text;
    const label = userLabel(msg);

    notifyAdmin(
      '\u{1F4E9} <b>Новая заявка — ПроЗемплюс</b>\n\n' +
        `\u{1F464} Имя: ${session.booking.name}\n` +
        `\u{1F4DE} Телефон: ${session.booking.phone}\n` +
        `\u{1F4AC} Telegram: ${label} (ID: ${msg.from.id})\n` +
        `\u{1F4C5} Дата: ${timestamp()}\n` +
        '\u{1F4CD} Источник: @prozemplus_bot',
    );

    bot.sendMessage(chatId,
      '✅ Заявка принята! Менеджер свяжется с вами в ближайшее время.\n\nНаш телефон: +7 (985) 905-25-55',
      mainMenuKeyboard(),
    );
    clearSession(chatId);
    return;
  }

  if (session.mode === 'write_question') {
    const label = userLabel(msg);
    notifyAdmin(
      '❓ <b>Вопрос от клиента — ПроЗемплюс</b>\n\n' +
        `\u{1F464} ${label} (ID: ${msg.from.id})\n` +
        `\u{1F4C5} ${timestamp()}\n\n` +
        `\u{1F4AC} ${text}`,
    );
    bot.sendMessage(chatId, '✅ Спасибо! Вопрос передан менеджеру. Ответим в ближайшее время.');
    clearSession(chatId);
    return;
  }

  // Unrecognized → forward to admin + show menu
  const label = userLabel(msg);
  notifyAdmin(
    '\u{1F4AC} <b>Сообщение — ПроЗемплюс бот</b>\n\n' +
      `\u{1F464} ${label} (ID: ${msg.from.id})\n` +
      `\u{1F4C5} ${timestamp()}\n\n` +
      `\u{1F4DD} ${text}`,
  );

  bot.sendMessage(chatId,
    'Спасибо за сообщение! Передал менеджеру. Пока могу помочь:',
    mainMenuKeyboard(),
  );
});

// ---------------------------------------------------------------------------
// Admin reply — reply to a forwarded message to send answer back to client
// ---------------------------------------------------------------------------
bot.on('message', (msg) => {
  if (String(msg.chat.id) !== String(ADMIN_CHAT_ID)) return;
  if (!msg.reply_to_message) return;
  if (!msg.reply_to_message.from || String(msg.reply_to_message.from.id) !== String(TOKEN.split(':')[0])) return;

  const originalText = msg.reply_to_message.text || '';
  const replyText = msg.text;
  if (!replyText) return;

  const idMatch = originalText.match(/\(ID:\s*(\d+)\)/);
  if (!idMatch) return;

  const clientChatId = idMatch[1];
  bot.sendMessage(
    clientChatId,
    `\u{1F4AC} <b>Ответ менеджера:</b>\n\n${replyText}\n\n<i>Ещё вопросы? Напишите здесь или позвоните: +7 (985) 905-25-55</i>`,
    { parse_mode: 'HTML' },
  ).then(() => {
    bot.sendMessage(ADMIN_CHAT_ID, `✅ Ответ отправлен клиенту (ID: ${clientChatId})`, { parse_mode: 'HTML' }).catch(() => {});
  }).catch((err) => {
    bot.sendMessage(ADMIN_CHAT_ID, `❌ Не удалось отправить: ${err.message}`, { parse_mode: 'HTML' }).catch(() => {});
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
bot.on('polling_error', (err) => {
  console.error('ПроЗемплюс bot polling error:', err.code, err.message);
});

console.log('ПроЗемплюс bot started in polling mode');
