import Image from "next/image";

/**
 * Справжній логотип ДіАнна (не літера-заглушка) — показується над заголовком
 * і на екрані правил, і на головному екрані гайду, щоб обидва читались як
 * один бренд. Файл public/images/dianna-logo.png обрізаний і з прозорим
 * фоном (див. коментар у globals.css поруч з кольоровою схемою — палітра
 * підібрана під це саме зображення).
 */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/images/dianna-logo.png"
      alt="ДіАнна Medical & SPA"
      width={538}
      height={570}
      priority
      className={`h-16 w-auto ${className}`}
    />
  );
}
