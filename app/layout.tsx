// [공통] 모든 화면의 바탕.
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SERVICE_NAME, SERVICE_ONE_LINER } from "@/lib/copy";

export const metadata: Metadata = { title: SERVICE_NAME, description: SERVICE_ONE_LINER };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#fbf6ef" };

// 글꼴(Figma 기준): 본문 Noto Sans KR, 로고·말풍선 Jua, 시각·숫자 Space Mono. 못 받으면 globals.css의 대체 글꼴로 보인다.
const FONTS = "https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
