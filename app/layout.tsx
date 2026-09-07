import type { Metadata } from "next";
import "./font.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "중등부 기도나무 | 교사용",
  description: "교사들이 함께하는 중등부 기도나무 프로젝트 — 학년별 기도 시간을 기록하고 통계를 확인해요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
