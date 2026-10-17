import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Vocabulario Chino–Español";
const APP_DESC =
  "Aprende vocabulario técnico chino–español con flashcards, quiz y juegos. Funciona offline.";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} · Proyecto El Domo`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESC,
  keywords: ["chino", "español", "vocabulario", "flashcards", "pinyin", "aprender chino"],
  authors: [{ name: "Proyecto El Domo" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESC,
    type: "website",
    images: ["/icons/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1C2C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#eef2f1] text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
