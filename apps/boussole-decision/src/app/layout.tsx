import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { I18nProvider } from "@/i18n/client";
import { getI18n } from "@/i18n/server";

const jost = localFont({ src: "./fonts/jost-latin.woff2", variable: "--font-jost", weight: "300 600" });
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin.woff2", style: "normal", weight: "400 600" },
    { path: "./fonts/cormorant-garamond-italic-latin.woff2", style: "italic", weight: "400 500" },
  ],
  variable: "--font-cormorant",
});
// Écriture manuscrite : seulement pour quelques surtitres, donc pas préchargée sur chaque page (75 Ko).
const caveat = localFont({ src: "./fonts/caveat-latin.woff2", variable: "--font-caveat", weight: "500 600", preload: false });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.common.appName, template: `%s · ${t.common.appName}` },
    description: t.common.appDescription,
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = { themeColor: "#fbf7f0" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale } = await getI18n();
  return (
    <html lang={locale} className={`${jost.variable} ${cormorant.variable} ${caveat.variable}`}>
      <body className="min-h-dvh">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
