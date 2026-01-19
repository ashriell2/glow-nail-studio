import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
 // <-- İŞTE SİHRİ YAPAN SATIR BU!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Glow Nail Studio",
  description: "Profesyonel Tırnak Stüdyosu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}