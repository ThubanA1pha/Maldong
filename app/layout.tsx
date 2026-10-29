// [공통] 모든 화면의 바탕.
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SERVICE_NAME, SERVICE_ONE_LINER } from "@/lib/copy";

export const metadata: Metadata = { title: SERVICE_NAME, description: SERVICE_ONE_LINER };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
