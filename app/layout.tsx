import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PULSE Wiki — 사내 지식 운전실",
  description: "현장 엔지니어를 위한 자율진화형 지식 그래프",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
