import { HomeClient } from "@/components/HomeClient";
import { getPublicContent } from "@/lib/content";

// Читаємо контент (кнопки, правила) з Vercel KV на сервері при кожному
// запиті, з коротким revalidate — щоб зміни з адмінки з'являлись майже
// одразу, але без зайвого навантаження на KV на кожен чих.
export const revalidate = 30;

export default async function Home() {
  const { buttons, rulesText } = await getPublicContent();

  return <HomeClient buttons={buttons} rulesText={rulesText} />;
}
