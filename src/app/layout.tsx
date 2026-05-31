import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToraFinance | ניהול כולל",
  description: "מערכת ניהול תרומות, מלגות ותפעול לכוללי אברכים"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
