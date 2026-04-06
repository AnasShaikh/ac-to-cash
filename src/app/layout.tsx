import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const GTAG_ID = "AW-953195901";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ACtoCash — Sell Your Old AC Instantly",
  description:
    "Get the best price for your old AC. Fill a quick form and our team will contact you with a quote.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GTAG_ID}');
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 text-slate-900 font-[var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
