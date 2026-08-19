import { kvGet, kvSet } from "@/lib/kv";
import {
  chatBot,
  mainLinks,
  rulesText as defaultRulesText,
  services as defaultServices,
} from "@/config/config";

const BUTTONS_KEY = "buttons:list";
const SERVICES_KEY = "services:text";
const RULES_KEY = "rules:text";

export type ManagedButton = {
  id: string;
  label: string;
  url: string;
  /** Акцентна кнопка (стиль типу телеграм-кнопки — градієнт замість білого). */
  accent: boolean;
};

/** Стартові кнопки, імпортовані з config.ts — використовуються, поки KV порожній. */
function defaultButtons(): ManagedButton[] {
  return [
    ...mainLinks.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      accent: false,
    })),
    { id: "chatbot", label: chatBot.label, url: chatBot.url, accent: true },
  ];
}

function defaultServicesText(): string {
  return defaultServices.map((s) => s.label).join("\n");
}

/** Список кнопок другого екрану. Порядок масиву — порядок показу. */
export async function getButtons(): Promise<ManagedButton[]> {
  const stored = await kvGet<ManagedButton[]>(BUTTONS_KEY);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  return defaultButtons();
}

/** Текст послуг акордеону — по одному пункту на рядок. */
export async function getServicesText(): Promise<string> {
  const stored = await kvGet<string>(SERVICES_KEY);
  if (typeof stored === "string" && stored.trim().length > 0) return stored;
  return defaultServicesText();
}

/** Повний текст правил проживання, показуваний на першому екрані. */
export async function getRulesText(): Promise<string> {
  const stored = await kvGet<string>(RULES_KEY);
  if (typeof stored === "string" && stored.trim().length > 0) return stored;
  return defaultRulesText;
}

export async function getPublicContent() {
  const [buttons, servicesText, rulesText] = await Promise.all([
    getButtons(),
    getServicesText(),
    getRulesText(),
  ]);
  return { buttons, servicesText, rulesText };
}

export type SaveContentInput = {
  buttons: ManagedButton[];
  servicesText: string;
  rulesText: string;
};

/** Записує весь контент в KV. Повертає false, якщо хоч один запис не вдався. */
export async function saveContent(input: SaveContentInput): Promise<boolean> {
  const results = await Promise.all([
    kvSet(BUTTONS_KEY, input.buttons),
    kvSet(SERVICES_KEY, input.servicesText),
    kvSet(RULES_KEY, input.rulesText),
  ]);
  return results.every(Boolean);
}
