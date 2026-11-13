import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SecondLife — Used smartphone valuation for India",
  description:
    "Don't overpay for a used phone. SecondLife uses machine learning to estimate resale value and tells you whether the seller's asking price is worth it.",
};

export const viewport: Viewport = {
  themeColor: "#080d0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
