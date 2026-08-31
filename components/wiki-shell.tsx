"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Clock3, FileText, GitBranch, Home, Network, Settings2, Sparkles, Star } from "lucide-react";
import { WikiHeader } from "./wiki-header";

export interface TocItem {
  id: string;
  label: string;
  depth?: 1 | 2 | 3;
  number?: string;
}

export interface WikiShellProps {
  children: ReactNode;
  toc?: TocItem[];
  activeTocId?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  sidebarFooter?: ReactNode;
}

const defaultToc: TocItem[] = [
  { id: "overview", number: "1", label: "개요" },
  { id: "spec", number: "2", label: "주요 제원" },
  { id: "construction", number: "3", label: "구조 및 작동 원리" },
  { id: "trouble", number: "4", label: "트러블슈팅" },
  { id: "practice", number: "5", label: "실무 팁" },
  { id: "references", number: "6", label: "관련 문서" },
];

export function WikiShell({
  children,
  toc = defaultToc,
  activeTocId: controlledActiveTocId,
  breadcrumbs = [{ label: "홈", href: "/" }, { label: "설비 기술" }, { label: "회전기기" }],
  sidebarFooter,
}: WikiShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTocId, setActiveTocId] = useState(controlledActiveTocId ?? toc[0]?.id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, Math.round((window.scrollY / scrollable) * 100)) : 0);
      const passed = toc.map((item) => document.getElementById(item.id)).filter((element): element is HTMLElement => Boolean(element)).filter((element) => element.getBoundingClientRect().top <= 120);
      setActiveTocId(passed.at(-1)?.id ?? toc[0]?.id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [toc]);

  return (
    <div className="wiki-app">
      <WikiHeader onMenuClick={() => setMenuOpen((open) => !open)} />
      <div className="wiki-layout">
        {menuOpen && <button className="sidebar-backdrop" aria-label="메뉴 닫기" onClick={() => setMenuOpen(false)} />}
        <aside className={`wiki-sidebar ${menuOpen ? "is-open" : ""}`} aria-label="위키 탐색">
          <nav className="sidebar-nav">
            <p className="sidebar-label">WORKSPACE</p>
            <Link href="/" onClick={() => setMenuOpen(false)} className="is-active"><Home size={17} /> 지식 홈</Link>
            <Link href="/recent"><Clock3 size={17} /> 최근 변경</Link>
            <Link href="/favorites"><Star size={17} /> 즐겨찾기 <span>12</span></Link>
            <p className="sidebar-label">KNOWLEDGE</p>
            <Link href="/category/equipment"><Settings2 size={17} /> 플랜트 설비</Link>
            <Link href="/category/regulations"><FileText size={17} /> 사내 규정</Link>
            <Link href="/people"><Network size={17} /> 실무자 디렉터리</Link>
            <Link href="/graph"><GitBranch size={17} /> 지식 그래프</Link>
            <p className="sidebar-label">AI TOOLS</p>
            <Link href="/wikifier" className="sidebar-ai-link"><Sparkles size={17} /> AI 위키파이어 <em>NEW</em></Link>
          </nav>
          <div className="sidebar-card">
            <BookOpen size={19} />
            <div><strong>오늘의 지식</strong><p>Mechanical Seal의 Flush Plan을 복습해 보세요.</p></div>
          </div>
          {sidebarFooter ?? <p className="sidebar-footer">NEXUS Wiki · Internal<br />Knowledge that compounds.</p>}
        </aside>

        <div className="wiki-content-frame">
          <div className="wiki-breadcrumbs" aria-label="현재 위치">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`}>
                {index > 0 && <ChevronRight size={13} />}
                {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
              </span>
            ))}
          </div>
          <main className="wiki-main">{children}</main>
        </div>

        <aside className="wiki-toc-rail" aria-label="문서 목차">
          <div className="wiki-toc">
            <div className="wiki-toc__heading"><span>CONTENTS</span><small>{toc.length} sections</small></div>
            <nav>
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`${activeTocId === item.id ? "is-active" : ""} depth-${item.depth ?? 1}`}
                >
                  {item.number && <span>{item.number}</span>}{item.label}
                </a>
              ))}
            </nav>
            <div className="wiki-toc__progress"><span style={{ width: `${progress}%` }} /><small>{progress}% 읽음</small></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
