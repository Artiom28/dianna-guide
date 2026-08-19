"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  isAdminAuthenticated,
  setAdminSessionCookie,
  verifyPassword,
} from "@/lib/adminAuth";
import { saveContent, type ManagedButton, type ManagedSocial } from "@/lib/content";
import type { SocialIcon } from "@/config/config";

const VALID_SOCIAL_ICONS: readonly SocialIcon[] = [
  "instagram",
  "facebook",
  "phone",
  "telegram",
  "youtube",
];

export type LoginState = { error: string | null };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD не налаштований на сервері." };
  }
  if (!password || !verifyPassword(password)) {
    return { error: "Невірний пароль." };
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export type SaveContentPayload = {
  buttons: ManagedButton[];
  rulesText: string;
  socials: ManagedSocial[];
};

export type SaveState = {
  success: boolean;
  error: string | null;
};

export async function saveContentAction(
  payload: SaveContentPayload
): Promise<SaveState> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return { success: false, error: "Сесія недійсна. Увійдіть знову." };
  }

  const buttons = payload.buttons
    .map((b) => ({
      id: b.id,
      label: b.label.trim(),
      type: b.type === "text" ? ("text" as const) : ("link" as const),
      url: b.url.trim(),
      content: b.content,
      accent: Boolean(b.accent),
    }))
    .filter((b) => b.label.length > 0 && (b.type === "text" ? b.content.trim().length > 0 : b.url.length > 0));

  const socials = payload.socials
    .map((s) => ({
      icon: VALID_SOCIAL_ICONS.includes(s.icon) ? s.icon : "instagram",
      url: s.url.trim(),
    }))
    .filter((s) => s.url.length > 0);

  const ok = await saveContent({
    buttons,
    rulesText: payload.rulesText,
    socials,
  });

  if (!ok) {
    return { success: false, error: "Не вдалося зберегти дані в KV." };
  }

  // Публічна сторінка кешується на 30с (revalidate) — інвалідовуємо одразу,
  // щоб зміни з'явились без очікування.
  revalidatePath("/");

  return { success: true, error: null };
}
