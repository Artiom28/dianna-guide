import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/adminCookie";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 днів

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Хеш пароля — саме він живе в cookie, а не сам пароль. */
function tokenForPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/** Звіряє введений пароль з ADMIN_PASSWORD за постійний час (захист від timing-атак). */
export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeStringEqual(password, expected);
}

export async function setAdminSessionCookie(): Promise<void> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return;
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, tokenForPassword(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

/** Строга перевірка сесії — використовується на сторінці /admin і в server actions. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!value) return false;
  return timingSafeStringEqual(value, tokenForPassword(password));
}
