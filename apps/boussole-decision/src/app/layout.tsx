import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const jost = localFont({ src: "./fonts/jost-latin.woff2", variable: "--font-jost", weight: "300 600" });
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin.woff2", style: "normal", weight: "400 600" },
    { path: "./fonts/cormorant-garamond-italic-latin.woff2", style: "italic", weight: "400 500" },
  ],
  variable: "--font-cormorant",
});
const caveat = localFont({ src: "./fonts/caveat-latin.woff2", variable: "--font-caveat", weight: "500 600" });

export const metadata: Metadata = {
  title: { default: "Boussole de décision", template: "%s · Boussole de décision" },
  description: "Choisir entre plusieurs opportunités professionnelles grâce à tes critères pondérés. Magic Humans.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#fbf7f0" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${jost.variable} ${cormorant.variable} ${caveat.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
