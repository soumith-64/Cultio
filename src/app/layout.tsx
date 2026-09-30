import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Cultivo — AI Agricultural Diagnostics & Decision Support",
  description:
    "Professional field diagnostic instrument for farmers and agronomists. Capture, locate, analyze environmental conditions, diagnose crop health, and escalate to human experts in real time.",
  keywords: [
    "crop diagnostics",
    "plant disease",
    "agronomy",
    "AI agriculture",
    "soil intelligence",
    "smart farming",
  ],
  authors: [{ name: "Cultivo Agronomy Systems" }],
};

export const viewport: Viewport = {
  themeColor: "#2E7D32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F9F6F0] text-[#4E342E] selection:bg-[#81C784]/30">
        {children}
      </body>
    </html>
  );
}
