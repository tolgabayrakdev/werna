import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Werna — Müşteri Geri Bildirim Platformu",
  description:
    "Müşterilerinizden QR kod ile anonim geri bildirim toplayın, yapay zeka ile sınıflandırın ve işletmenizi veri odaklı geliştirin.",
  keywords: [
    "geri bildirim",
    "müşteri memnuniyeti",
    "QR kod",
    "anonim geri bildirim",
    "işletme",
    "restoran",
    "kafe",
    "otel",
  ],
  openGraph: {
    title: "Werna — Müşteri Geri Bildirim Platformu",
    description:
      "QR kod ile anonim geri bildirim toplayın, yapay zeka ile sınıflandırın ve işletmenizi geliştirin.",
    type: "website",
    locale: "tr_TR",
    siteName: "Werna",
  },
  twitter: {
    card: "summary_large_image",
    title: "Werna — Müşteri Geri Bildirim Platformu",
    description:
      "QR kod ile anonim geri bildirim toplayın, yapay zeka ile sınıflandırın ve işletmenizi geliştirin.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
