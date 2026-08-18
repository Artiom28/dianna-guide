# DiAnna Guide

PWA-довідник для гостей **DiAnna Medical & SPA**.

## Стек

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS
- PWA: `manifest.json` + мінімальний service worker (`public/sw.js`)

## Контент

Весь текст і всі посилання застосунку зберігаються в одному файлі:
[`src/config/config.ts`](./src/config/config.ts). Щоб оновити текст правил
проживання, посилання на SPA/ресторан/чат-бот, список послуг чи контакти
соцмереж — редагуйте лише цей файл, код чіпати не потрібно.

## Розробка

```bash
npm install
npm run dev
```

## Білд

```bash
npm run build
```
