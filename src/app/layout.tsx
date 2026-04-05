import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ACtoCash — Sell Your Old AC Instantly",
  description:
    "Get the best price for your old AC. Fill a quick form and our team will contact you with a quote.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-953195901"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-953195901');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 text-slate-900 font-[var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
