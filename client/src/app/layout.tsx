import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "../lib/toast";
import AnnouncementModalGate from "@/components/AnnouncementModalGate";

function metadataBaseFromEnv(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

const metadataBase = metadataBaseFromEnv();

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: "TSE Academy",
  description: "Онлайн сургалтын платформ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <AnnouncementModalGate />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
