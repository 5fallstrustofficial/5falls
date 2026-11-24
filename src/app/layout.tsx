import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://5falls.org"),
  title: "Five Falls Women's Welfare Trust | Puduthangal Lake, Tambaram",
  description:
    "Five Falls Women's Welfare Trust (5Falls) is restoring Puduthangal Lake on Mudichur Road, Tambaram, Chennai. A dry lake, reshaped to hold rainwater again. Help the work by GPay / UPI.",
  keywords: [
    "5Falls",
    "Puduthangal Lake",
    "Tambaram",
    "Chennai Lake Restoration",
    "Five Falls Women's Welfare Trust",
    "Shanthi S ExNoRa",
    "Tambaram Corporation",
    "Tamil Nadu Volunteers",
    "Mudichur Road",
  ],
  authors: [{ name: "Five Falls Women's Welfare Trust" }],
  openGraph: {
    title: "Five Falls Women's Welfare Trust | Puduthangal Lake, Tambaram",
    description:
      "Bringing Puduthangal Lake back to life. After 15–16 dry years, water has returned to the lake bed. Support the work.",
    url: "https://5falls.org/",
    siteName: "5Falls Trust",
    images: [
      {
        url: "/img/share.jpg",
        width: 1200,
        height: 630,
        alt: "Puduthangal Lake Revival",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: "/img/favicon-32.png",
    apple: "/img/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/img/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/img/apple-touch-icon.png" />
        <meta name="theme-color" content="#2E2980" />
      </head>
      <body className="font-sans bg-[#f9fafb] text-[#000000] min-h-screen selection:bg-[#006aff] selection:text-white">
        <SmoothScroll />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
