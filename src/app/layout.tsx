import type { Metadata, Viewport } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import { InstallPromptListener } from "@/components/InstallPromptListener";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { siteConfig } from "@/config/config";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const THEME_COLOR = "#f5efe1";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: `PWA-довідник для гостей ${siteConfig.hotelName}`,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Дозволяє контенту сягати країв екрана на пристроях з вирізом/заокругленими
  // кутами, щоб env(safe-area-inset-*) повертав реальні значення — потрібно
  // для відступу заголовка RulesOverlay від системних елементів зверху.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${fraunces.variable} ${workSans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full">
        {children}
        <ServiceWorkerRegistration />
        <InstallPromptListener />
      </body>
    </html>
  );
}
