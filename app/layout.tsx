import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "PaySmart — Effective Price Finder",
  description: "Find the lowest effective price after your card cashback and bank offers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }} className="bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
