/**
 * Обчислює стабільний ключ запису журналу погоджень для видалення.
 *
 * Записи, зроблені вже після додавання id (crypto.randomUUID() у
 * appendAgreementLog), мають власний id — використовуємо його. Старіші
 * записи (зроблені до цього) id не мають, тож падаємо назад на комбінацію
 * полів, які разом практично напевно унікальні для одного запису
 * (timestamp з мілісекундною точністю + ім'я + кімната + телефон).
 *
 * Живе в окремому модулі без жодних Node-специфічних імпортів (на відміну
 * від lib/content.ts, який тягне fs/path через lib/kv.ts), щоб його можна
 * було безпечно імпортувати і в клієнтські компоненти (AgreementLogTable,
 * AdminDashboard), і в серверний lib/content.ts — з однаковим результатом
 * по обидва боки.
 */
export type AgreementKeySource = {
  id?: string;
  timestamp: string;
  name: string;
  roomNumber: string;
  phone: string;
};

export function agreementEntryKey(entry: AgreementKeySource): string {
  return entry.id || `${entry.timestamp}|${entry.name}|${entry.roomNumber}|${entry.phone}`;
}
