/**
 * Legal — реквизиты ИП ЗемПлюс. Используется в Privacy/Contacts/Footer.
 *
 * Когда придут ФИО + юр. адрес — заполнить fullName и legalAddress.
 */

export const LEGAL = {
  brand: "ЗемПлюс",
  domain: "zem-plus.ru",
  // Юридическое
  type: "ИП", // ИП | ООО
  fullName: "Индивидуальный предприниматель Бротцель Антон Викторович",
  shortName: "ИП Бротцель А.В.",
  inn: "503440358928",
  ogrn: "324508100684518", // ОГРНИП
  legalAddress: "Московская область", // TODO: уточнить полный юр. адрес регистрации
  // Контакты
  phone: "+7 (985) 905-25-55",
  phoneRaw: "+79859052555",
  email: "info@zem-plus.ru",
  telegram: "https://t.me/zemplus",
  max: "https://max.ru/zemplus",
  // Даты документов
  privacyUpdatedAt: "2026-04-18",
  policyVersion: "1.0",
} as const;
