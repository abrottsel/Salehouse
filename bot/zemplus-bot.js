const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TG_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TG_CHAT_ID;
const MAX_BOT_TOKEN = process.env.MAX_BOT_TOKEN;
const SITE_URL = process.env.SITE_URL || 'https://xn--e1adndpn4g.xn--p1ai';

if (!TOKEN) {
  console.error('TG_BOT_TOKEN is not set');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// ---------------------------------------------------------------------------
// Village data
// ---------------------------------------------------------------------------
const villages = [
  { name: 'Фаворит', direction: 'Каширское шоссе', distance: 30, priceFrom: 490000, areaFrom: 6, areaTo: 20 },
  { name: 'Лесной Остров', direction: 'Каширское шоссе', distance: 36, priceFrom: 625000, areaFrom: 6, areaTo: 15 },
  { name: 'Новое Сонино', direction: 'Каширское шоссе', distance: 37, priceFrom: 355000, areaFrom: 6, areaTo: 25 },
  { name: 'Дачная Практика-2', direction: 'Каширское шоссе', distance: 42, priceFrom: 180000, areaFrom: 6, areaTo: 30 },
  { name: 'Регата', direction: 'Симферопольское шоссе', distance: 45, priceFrom: 190000, areaFrom: 6, areaTo: 20 },
  { name: 'Есенино', direction: 'Симферопольское шоссе', distance: 50, priceFrom: 220000, areaFrom: 8, areaTo: 25 },
  { name: 'Каретный Ряд', direction: 'Дмитровское шоссе', distance: 42, priceFrom: 350000, areaFrom: 6, areaTo: 15 },
  { name: 'Триумфальный', direction: 'Дмитровское шоссе', distance: 48, priceFrom: 250000, areaFrom: 8, areaTo: 20 },
];

// ---------------------------------------------------------------------------
// Session store (in-memory, keyed by chatId)
// ---------------------------------------------------------------------------
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {});
  }
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

function userLabelFromQuery(query) {
  const u = query.from || {};
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

// Why: MAX API ждёт user_id в query string, body содержит только {text, notify}.
// Старый формат `{recipient: {user_id}, text}` возвращает HTTP 400 / "Unknown recipient",
// fetch не считает HTTP 400 за ошибку — поэтому ответ админа в TG молча терялся.
async function sendMaxMessage(userId, text) {
  if (!MAX_BOT_TOKEN) return { ok: false, error: 'MAX_BOT_TOKEN not set' };
  try {
    const res = await fetch(
      `https://platform-api.max.ru/messages?user_id=${encodeURIComponent(userId)}`,
      {
        method: 'POST',
        headers: { Authorization: MAX_BOT_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, notify: true }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status} ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function formatPrice(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
          { text: '\u2753 Частые вопросы', callback_data: 'faq' },
        ],
        [
          { text: '\u270F\uFE0F Написать вопрос', callback_data: 'write_question' },
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
    '\u{1F44B} Добрый день! Я — ассистент ЗемПлюс.\n' +
    'Помогу подобрать земельный участок в Подмосковье.\n\n' +
    'Выберите интересующий раздел или напишите свой вопрос:';
  bot.sendMessage(msg.chat.id, text, mainMenuKeyboard());
});

// ---------------------------------------------------------------------------
// Callback query handler
// ---------------------------------------------------------------------------
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const session = getSession(chatId);

  bot.answerCallbackQuery(query.id).catch(() => {});

  // ---- Main menu ----
  if (data === 'menu') {
    clearSession(chatId);
    const text =
      '\u{1F44B} Добрый день! Я — ассистент ЗемПлюс.\n' +
      'Помогу подобрать земельный участок в Подмосковье.\n\n' +
      'Выберите интересующий раздел или напишите свой вопрос:';
    bot.sendMessage(chatId, text, mainMenuKeyboard());
    return;
  }

  // ==== SELECT PLOT FUNNEL ====
  if (data === 'select_plot') {
    session.funnel = { step: 'direction' };
    bot.sendMessage(chatId, '\u{1F697} Какое направление вас интересует?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Каширское шоссе', callback_data: 'dir_kashir' },
            { text: 'Симферопольское шоссе', callback_data: 'dir_simfer' },
          ],
          [
            { text: 'Дмитровское шоссе', callback_data: 'dir_dmitrov' },
            { text: 'Новорижское шоссе', callback_data: 'dir_novorig' },
          ],
          [
            { text: 'Любое направление', callback_data: 'dir_any' },
          ],
        ],
      },
    });
    return;
  }

  // Direction selected
  if (data.startsWith('dir_')) {
    const dirMap = {
      dir_kashir: 'Каширское шоссе',
      dir_simfer: 'Симферопольское шоссе',
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
            { text: 'до 300 000 \u20BD', callback_data: 'price_300' },
            { text: '300\u2013500 000 \u20BD', callback_data: 'price_500' },
          ],
          [
            { text: '500 000 \u2013 1 млн \u20BD', callback_data: 'price_1m' },
            { text: 'от 1 млн \u20BD', callback_data: 'price_1m_plus' },
          ],
        ],
      },
    });
    return;
  }

  // Budget selected
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
            { text: '6\u20138 соток', callback_data: 'area_6_8' },
            { text: '8\u201312 соток', callback_data: 'area_8_12' },
          ],
          [
            { text: '12\u201320 соток', callback_data: 'area_12_20' },
            { text: 'от 20 соток', callback_data: 'area_20_plus' },
          ],
        ],
      },
    });
    return;
  }

  // Area selected — show results
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
      results = villages.filter((v) => {
        if (direction && direction !== 'any' && v.direction !== direction) return false;
        return true;
      });
    }

    results = results.slice(0, 3);

    if (results.length === 0) {
      bot.sendMessage(
        chatId,
        'К сожалению, точных совпадений не найдено. Наш менеджер поможет подобрать подходящий вариант!\n\n' +
          '\u{1F4DE} Записаться на бесплатный просмотр?',
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '\u2705 Да', callback_data: 'book_yes' },
                { text: '\u25C0\uFE0F Вернуться в меню', callback_data: 'menu' },
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
      text += `   \u{1F4B0} от ${formatPrice(v.priceFrom)} \u20BD/сотка\n`;
      text += `   \u{1F4D0} ${v.areaFrom}\u2013${v.areaTo} соток\n\n`;
    });
    text += `\u{1F517} Смотреть на сайте: ${SITE_URL}\n\n`;
    text += '\u{1F4DE} Записаться на бесплатный просмотр?';

    bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '\u2705 Да', callback_data: 'book_yes' },
            { text: '\u25C0\uFE0F Вернуться в меню', callback_data: 'menu' },
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

  // ==== PRICES ====
  if (data === 'prices') {
    clearSession(chatId);
    const text =
      '\u{1F4B0} <b>Цены на участки ЗемПлюс</b>\n\n' +
      '\u{1F4CA} Стоимость за сотку:\n' +
      '\u2022 Каширское шоссе — от 180 000 \u20BD\n' +
      '\u2022 Симферопольское шоссе — от 190 000 \u20BD\n' +
      '\u2022 Дмитровское шоссе — от 250 000 \u20BD\n' +
      '\u2022 Новорижское шоссе — от 350 000 \u20BD\n\n' +
      '\u{1F4B3} <b>Рассрочка:</b>\n' +
      '\u2022 До 12 месяцев без переплат\n' +
      '\u2022 Первый взнос от 50 000 \u20BD\n' +
      '\u2022 Без справок и одобрений\n\n' +
      '\u{1F3E6} Ипотека от 6.5% — /mortgage\n\n' +
      `\u{1F517} Смотреть все цены на сайте: ${SITE_URL}`;
    bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '\u{1F3E6} Подробнее об ипотеке', callback_data: 'mortgage' },
            { text: '\u{1F3E1} Подобрать участок', callback_data: 'select_plot' },
          ],
          [{ text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
        ],
      },
    });
    return;
  }

  // ==== VILLAGES ====
  if (data === 'villages') {
    clearSession(chatId);
    const text =
      '\u{1F4CD} <b>Наши посёлки в Подмосковье</b>\n\n' +
      'Мы работаем в 4 направлениях:\n\n' +
      '\u{1F697} <b>Каширское шоссе</b> (30-50 км от МКАД)\n' +
      'Фаворит, Лесной Остров, Новое Сонино, Дачная Практика-2 и др.\n\n' +
      '\u{1F697} <b>Симферопольское шоссе</b> (35-60 км)\n' +
      'Регата, Есенино, Ильинское и др.\n\n' +
      '\u{1F697} <b>Дмитровское шоссе</b> (40-55 км)\n' +
      'Каретный Ряд, Триумфальный и др.\n\n' +
      '\u{1F697} <b>Новорижское шоссе</b> (45-70 км)\n' +
      'Премиальные посёлки с лесом\n\n' +
      'Всего 31 посёлок, 2800+ участков\n\n' +
      `\u{1F517} Каталог на сайте: ${SITE_URL}`;
    bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '\u{1F3E1} Подобрать участок', callback_data: 'select_plot' },
            { text: '\u{1F4DE} Записаться на просмотр', callback_data: 'book_viewing' },
          ],
          [{ text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
        ],
      },
    });
    return;
  }

  // ==== MORTGAGE ====
  if (data === 'mortgage') {
    clearSession(chatId);
    const text =
      '\u{1F3E6} <b>Ипотека на земельный участок</b>\n\n' +
      'Работаем с 6 ведущими банками:\n\n' +
      '\u2022 ВТБ — от 6.5%\n' +
      '\u2022 Сбер — от 7.0%\n' +
      '\u2022 Альфа-Банк — от 6.9%\n' +
      '\u2022 Газпромбанк — от 7.2%\n' +
      '\u2022 Россельхозбанк — от 6.8%\n' +
      '\u2022 Т-Банк — от 7.5%\n\n' +
      '\u{1F4CB} <b>Что нужно:</b>\n' +
      '\u2022 Паспорт РФ\n' +
      '\u2022 Справка о доходах (или по форме банка)\n' +
      '\u2022 Первый взнос от 15%\n\n' +
      '\u23F1 Одобрение за 1-3 дня\n\n' +
      `\u{1F517} Рассчитать платёж: ${SITE_URL}/v2/mortgage`;
    bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '\u{1F4B0} Рассчитать платёж', url: `${SITE_URL}/v2/mortgage` },
            { text: '\u{1F4DE} Консультация по ипотеке', callback_data: 'book_viewing' },
          ],
          [{ text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
        ],
      },
    });
    return;
  }

  // ==== HOW TO BUY ====
  if (data === 'how_to_buy') {
    clearSession(chatId);
    const text =
      '\u{1F4CB} <b>6 шагов до вашего участка</b>\n\n' +
      '1\uFE0F\u20E3 <b>Звонок или заявка</b> (5 мин)\n' +
      'Оставьте заявку — мы подберём варианты\n\n' +
      '2\uFE0F\u20E3 <b>Бесплатный просмотр</b> (1-2 часа)\n' +
      'Покажем посёлки, инфраструктуру, участки\n\n' +
      '3\uFE0F\u20E3 <b>Выбор участка</b>\n' +
      'Поможем выбрать лучший по расположению и цене\n\n' +
      '4\uFE0F\u20E3 <b>Бронирование</b> (1 день)\n' +
      'Фиксируем цену, вносим минимальный залог\n\n' +
      '5\uFE0F\u20E3 <b>Оформление документов</b> (5-7 дней)\n' +
      'Договор, проверка юр. чистоты, регистрация\n\n' +
      '6\uFE0F\u20E3 <b>Получение документов</b>\n' +
      'Выписка из ЕГРН — участок ваш!\n\n' +
      '\u2696\uFE0F 100% юридическая чистота гарантирована по договору\n\n' +
      `\u{1F517} Подробнее: ${SITE_URL}/v2/how-to-buy`;
    bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '\u{1F4DE} Записаться на просмотр', callback_data: 'book_viewing' },
            { text: '\u{1F3E1} Подобрать участок', callback_data: 'select_plot' },
          ],
          [{ text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
        ],
      },
    });
    return;
  }

  // ==== FAQ ====
  if (data === 'faq') {
    clearSession(chatId);
    bot.sendMessage(chatId, '\u2753 <b>Частые вопросы</b>\n\nВыберите интересующий вопрос:', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Какая категория земли?', callback_data: 'faq_category' }],
          [{ text: 'Можно ли прописаться?', callback_data: 'faq_propiska' }],
          [{ text: 'Есть ли коммуникации?', callback_data: 'faq_comm' }],
          [{ text: 'Какие документы нужны?', callback_data: 'faq_docs' }],
          [{ text: 'Есть ли рассрочка?', callback_data: 'faq_rassrochka' }],
          [{ text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
        ],
      },
    });
    return;
  }

  // FAQ answers
  if (data === 'faq_category') {
    bot.sendMessage(
      chatId,
      '\u{1F3E0} <b>Категория земли</b>\n\n' +
        'Все наши участки — ИЖС (индивидуальное жилищное строительство). ' +
        'Это лучшая категория: можно строить дом, прописаться, подключить газ и свет.',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '\u{1F3E1} Подобрать участок', callback_data: 'select_plot' }],
            [{ text: '\u25C0\uFE0F К вопросам', callback_data: 'faq' }, { text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
          ],
        },
      },
    );
    return;
  }

  if (data === 'faq_propiska') {
    bot.sendMessage(
      chatId,
      '\u{1F4DD} <b>Прописка</b>\n\n' +
        'Да! На участках ИЖС можно оформить постоянную регистрацию (прописку). ' +
        'Для этого нужно построить жилой дом и ввести его в эксплуатацию.',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '\u{1F4CB} Как купить участок', callback_data: 'how_to_buy' }],
            [{ text: '\u25C0\uFE0F К вопросам', callback_data: 'faq' }, { text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
          ],
        },
      },
    );
    return;
  }

  if (data === 'faq_comm') {
    bot.sendMessage(
      chatId,
      '\u{1F527} <b>Коммуникации</b>\n\n' +
        'В готовых посёлках подведены:\n' +
        '\u2705 Газ\n\u2705 Электричество\n\u2705 Асфальтовые дороги\n\u2705 Охрана\n\n' +
        'Водоснабжение — скважина (помогаем с бурением).',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '\u{1F4CD} Посёлки и направления', callback_data: 'villages' }],
            [{ text: '\u25C0\uFE0F К вопросам', callback_data: 'faq' }, { text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
          ],
        },
      },
    );
    return;
  }

  if (data === 'faq_docs') {
    bot.sendMessage(
      chatId,
      '\u{1F4C4} <b>Документы для покупки</b>\n\n' +
        'Для покупки нужен только паспорт РФ.\n\n' +
        'Мы готовим:\n' +
        '\u2022 Договор купли-продажи\n' +
        '\u2022 Акт приёма-передачи\n' +
        '\u2022 Подаём на регистрацию в Росреестр',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '\u{1F4DE} Записаться на просмотр', callback_data: 'book_viewing' }],
            [{ text: '\u25C0\uFE0F К вопросам', callback_data: 'faq' }, { text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
          ],
        },
      },
    );
    return;
  }

  if (data === 'faq_rassrochka') {
    bot.sendMessage(
      chatId,
      '\u{1F4B3} <b>Рассрочка</b>\n\n' +
        'Да! Рассрочка до 12 месяцев без переплат.\n' +
        'Первый взнос от 50 000 \u20BD.\n' +
        'Без справок и банковских одобрений.',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '\u{1F4B0} Цены и рассрочка', callback_data: 'prices' }],
            [{ text: '\u25C0\uFE0F К вопросам', callback_data: 'faq' }, { text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
          ],
        },
      },
    );
    return;
  }

  // ==== WRITE QUESTION ====
  if (data === 'write_question') {
    session.mode = 'write_question';
    bot.sendMessage(
      chatId,
      '\u270F\uFE0F Напишите ваш вопрос — я передам его менеджеру, и мы ответим в ближайшее время.\n\n' +
        'Или позвоните: +7 (985) 905-25-55',
    );
    return;
  }
});

// ---------------------------------------------------------------------------
// /mortgage alias
// ---------------------------------------------------------------------------
bot.onText(/\/mortgage/, (msg) => {
  const chatId = msg.chat.id;
  clearSession(chatId);
  const text =
    '\u{1F3E6} <b>Ипотека на земельный участок</b>\n\n' +
    'Работаем с 6 ведущими банками:\n\n' +
    '\u2022 ВТБ — от 6.5%\n' +
    '\u2022 Сбер — от 7.0%\n' +
    '\u2022 Альфа-Банк — от 6.9%\n' +
    '\u2022 Газпромбанк — от 7.2%\n' +
    '\u2022 Россельхозбанк — от 6.8%\n' +
    '\u2022 Т-Банк — от 7.5%\n\n' +
    '\u{1F4CB} <b>Что нужно:</b>\n' +
    '\u2022 Паспорт РФ\n' +
    '\u2022 Справка о доходах (или по форме банка)\n' +
    '\u2022 Первый взнос от 15%\n\n' +
    '\u23F1 Одобрение за 1-3 дня\n\n' +
    `\u{1F517} Рассчитать платёж: ${SITE_URL}/v2/mortgage`;
  bot.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '\u{1F4B0} Рассчитать платёж', url: `${SITE_URL}/v2/mortgage` },
          { text: '\u{1F4DE} Консультация по ипотеке', callback_data: 'book_viewing' },
        ],
        [{ text: '\u25C0\uFE0F Главное меню', callback_data: 'menu' }],
      ],
    },
  });
});

// ---------------------------------------------------------------------------
// Text message handler (booking flow, write-question mode, unrecognized)
// ---------------------------------------------------------------------------
bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const session = getSession(chatId);
  const text = msg.text.trim();

  // ---- Booking flow: waiting for name ----
  if (session.booking && session.booking.step === 'name') {
    session.booking.name = text;
    session.booking.step = 'phone';
    bot.sendMessage(chatId, '\u{1F4DE} Ваш номер телефона?');
    return;
  }

  // ---- Booking flow: waiting for phone ----
  if (session.booking && session.booking.step === 'phone') {
    session.booking.phone = text;
    const label = userLabel(msg);

    notifyAdmin(
      '\u{1F4E9} <b>Новая заявка на просмотр</b>\n\n' +
        `\u{1F464} Имя: ${session.booking.name}\n` +
        `\u{1F4DE} Телефон: ${session.booking.phone}\n` +
        `\u{1F4AC} Telegram: ${label} (ID: ${msg.from.id})\n` +
        `\u{1F4C5} Дата: ${timestamp()}\n` +
        '\u{1F4CD} Источник: Telegram бот',
    );

    bot.sendMessage(
      chatId,
      '\u2705 Заявка принята! Менеджер свяжется с вами в ближайшее время.\n' +
        'Наш телефон: +7 (985) 905-25-55',
      mainMenuKeyboard(),
    );
    clearSession(chatId);
    return;
  }

  // ---- Write question mode ----
  if (session.mode === 'write_question') {
    const label = userLabel(msg);
    notifyAdmin(
      '\u2753 <b>Вопрос от клиента</b>\n\n' +
        `\u{1F464} ${label} (ID: ${msg.from.id})\n` +
        `\u{1F4C5} ${timestamp()}\n\n` +
        `\u{1F4AC} ${text}`,
    );
    bot.sendMessage(chatId, '\u2705 Спасибо! Ваш вопрос передан менеджеру. Ответим в ближайшее время.');
    clearSession(chatId);
    return;
  }

  // ---- Unrecognized text: forward to admin, show menu ----
  const label = userLabel(msg);
  notifyAdmin(
    '\u{1F4AC} <b>Сообщение от пользователя</b>\n\n' +
      `\u{1F464} ${label} (ID: ${msg.from.id})\n` +
      `\u{1F4C5} ${timestamp()}\n\n` +
      `\u{1F4DD} ${text}`,
  );

  bot.sendMessage(
    chatId,
    'Спасибо за сообщение! Я передал его менеджеру. А пока могу помочь с частыми вопросами:',
    mainMenuKeyboard(),
  );
});

// ---------------------------------------------------------------------------
// Admin reply — reply to a forwarded message to send answer back to client
// When admin replies to a bot notification (containing "ID: 123456789"),
// the bot extracts the client chat ID and sends the admin's reply to them.
// ---------------------------------------------------------------------------
bot.on('message', (msg) => {
  // Only process replies in admin chat
  if (String(msg.chat.id) !== String(ADMIN_CHAT_ID)) return;
  if (!msg.reply_to_message) return;
  // Must be replying to a bot's own message (not another user's)
  if (!msg.reply_to_message.from || String(msg.reply_to_message.from.id) !== String(bot.options?.selfId || TOKEN.split(':')[0])) return;

  const originalText = msg.reply_to_message.text || '';
  const replyText = msg.text;
  if (!replyText) return;

  // Reply to MAX client
  const maxIdMatch = originalText.match(/\[MAX_ID:\s*(\d+)\]/);
  if (maxIdMatch) {
    const maxUserId = Number(maxIdMatch[1]);
    sendMaxMessage(maxUserId,
      `💬 Ответ менеджера:\n\n${replyText}\n\n📞 Вопросы? Напишите здесь или позвоните: +7 (985) 905-25-55`,
    ).then((result) => {
      if (result.ok) {
        bot.sendMessage(ADMIN_CHAT_ID, `✅ Ответ отправлен в МАКС (MAX_ID: ${maxUserId})`, { parse_mode: 'HTML' }).catch(() => {});
      } else {
        bot.sendMessage(ADMIN_CHAT_ID, `❌ Не удалось отправить в МАКС (MAX_ID: ${maxUserId}): ${result.error}`, { parse_mode: 'HTML' }).catch(() => {});
      }
    });
    return;
  }

  // Reply to Telegram client
  const idMatch = originalText.match(/\(ID:\s*(\d+)\)/);
  if (!idMatch) return;

  const clientChatId = idMatch[1];
  bot.sendMessage(clientChatId,
    `💬 <b>Ответ менеджера:</b>\n\n${replyText}\n\n<i>Есть ещё вопросы? Напишите здесь или позвоните: +7 (985) 905-25-55</i>`,
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
  console.error('Polling error:', err.code, err.message);
});

console.log('ZemPlus bot started in polling mode');
