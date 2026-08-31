"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWikiStore } from "@/store/wiki-store";
import {
  Bell,
  BookOpenText,
  ChevronDown,
  Clock3,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  UserRound,
  X,
} from "lucide-react";

export interface WikiHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function WikiHeader({
  title = "NEXUS Wiki",
  subtitle = "Plant Knowledge Network",
  onMenuClick,
}: WikiHeaderProps) {
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const documents = useWikiStore((state) => state.documents);
  const results = query.trim() ? documents.filter((document) => [document.title, document.summary, ...document.tags].some((value) => value.toLocaleLowerCase("ko-KR").includes(query.toLocaleLowerCase("ko-KR")))).slice(0, 6) : [];

  useEffect(() => {
    const stored = localStorage.getItem("wiki-theme");
    const shouldDark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", shouldDark);
    setDark(shouldDark);
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        window.setTimeout(() => document.querySelector<HTMLInputElement>(".wiki-search input")?.focus(), 0);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("wiki-theme", next ? "dark" : "light");
  };

  return (
    <header className="wiki-header">
      <div className="wiki-header__inner">
        <button
          className="icon-button wiki-header__menu"
          aria-label="탐색 메뉴 열기"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

        <Link href="/" className="wiki-brand" aria-label={`${title} 홈`}>
          <span className="wiki-brand__mark"><BookOpenText size={21} /></span>
          <span className="wiki-brand__copy">
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </span>
        </Link>

        <nav className="wiki-header__nav" aria-label="주 메뉴">
          <Link href="/recent"><Clock3 size={15} /> 최근 변경</Link>
          <Link href="/random">임의 문서</Link>
          <Link href="/categories">분류 <ChevronDown size={14} /></Link>
        </nav>

        <div className={`wiki-search ${searchOpen ? "is-open" : ""}`}>
          <Search size={17} aria-hidden />
          <input
            aria-label="위키 검색"
            placeholder="문서, 설비, 규정 검색"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results[0]) {
                router.push(`/wiki/${encodeURIComponent(results[0].slug)}`);
                setQuery(""); setSearchOpen(false);
              }
              if (event.key === "Escape") { setQuery(""); setSearchOpen(false); }
            }}
          />
          <kbd>Ctrl K</kbd>
          <button className="wiki-search__close" onClick={() => setSearchOpen(false)} aria-label="검색 닫기">
            <X size={18} />
          </button>
          {query && <div className="header-search-results">{results.length ? results.map((document) => <button key={document.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { router.push(`/wiki/${encodeURIComponent(document.slug)}`); setQuery(""); setSearchOpen(false); }}><strong>{document.title}</strong><small>{document.categories[0]} · {document.summary}</small></button>) : <p>결과 없음 · 새 문서에서 작성할 수 있습니다.</p>}</div>}
        </div>

        <div className="wiki-header__actions">
          <button className="icon-button mobile-search-button" aria-label="검색 열기" onClick={() => setSearchOpen(true)}>
            <Search size={19} />
          </button>
          <Link href="/new" className="header-create-button"><Plus size={16} /> 새 문서</Link>
          <button className="icon-button" aria-label="테마 전환" onClick={toggleTheme}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-button notification-button" aria-label="알림">
            <Bell size={18} /><span aria-label="읽지 않은 알림 3개">3</span>
          </button>
          <button className="profile-button" aria-label="사용자 메뉴">
            <span><UserRound size={17} /></span>
            <span className="profile-button__copy"><strong>김현우</strong><small>설비기술팀</small></span>
            <Settings size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
