"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Clock3,
  Edit3,
  Eye,
  GitCompareArrows,
  Link2,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { WikiShell } from "@/components/wiki-shell";
import { Infobox } from "@/components/infobox";
import { EditorPanel, type WikiRevision as EditorRevision } from "@/components/editor-panel";
import { WikifierDropzone } from "@/components/wikifier-dropzone";
import { DiffViewer } from "@/components/diff-viewer";
import { WikiRenderer, extractToc, getBacklinks, resolveWikiDocument } from "@/lib/wiki-parser";
import { useWikiStore } from "@/store/wiki-store";
import type { WikiDocument } from "@/types/wiki";

type View = "read" | "edit" | "history" | "wikifier" | "explore";

const dateTime = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function toEditorRevisions(document: WikiDocument): EditorRevision[] {
  return document.revisions.map((revision) => ({
    ...revision,
    author: `${revision.author.name} · ${revision.author.department}`,
  }));
}

function AssetSketch({ title }: { title: string }) {
  const pump = title.includes("펌프");
  return (
    <div className="asset-sketch" aria-label={`${title} 기술 도해`}>
      <div className={pump ? "asset-machine asset-machine--pump" : "asset-machine"}>
        <span /><i /><b />
      </div>
      <small>설비 디지털 트윈 · 실시간</small>
    </div>
  );
}

function SearchPanel({ documents, onSelect }: { documents: WikiDocument[]; onSelect: (document: WikiDocument) => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const key = query.trim().toLocaleLowerCase("ko-KR");
    if (!key) return documents.slice(0, 6);
    return documents.filter((document) =>
      [document.title, document.summary, ...document.tags].some((value) => value.toLocaleLowerCase("ko-KR").includes(key)),
    ).slice(0, 8);
  }, [documents, query]);

  return (
    <div className="document-finder">
      <Search size={16} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="지식 그래프에서 문서 검색…" aria-label="문서 검색" />
      {query && (
        <div className="document-finder__results">
          {results.length ? results.map((document) => (
            <button key={document.id} onClick={() => { onSelect(document); setQuery(""); }}>
              <strong>{document.title}</strong><span>{document.categories[0]} · {document.summary}</span>
            </button>
          )) : <p>일치하는 문서가 없습니다. Enter를 눌러 새 문서를 만드세요.</p>}
        </div>
      )}
      <kbd>문서 {documents.length}개</kbd>
    </div>
  );
}

export function WikiApp({ initialTarget }: { initialTarget?: string } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const documents = useWikiStore((state) => state.documents);
  const updateDocument = useWikiStore((state) => state.updateDocument);
  const rollbackDocument = useWikiStore((state) => state.rollbackDocument);
  const createDocument = useWikiStore((state) => state.createDocument);
  const [selectedId, setSelectedId] = useState(() => (initialTarget ? resolveWikiDocument(initialTarget, documents)?.id : undefined) ?? documents[0]?.id ?? "");
  const [view, setView] = useState<View>("read");
  const [historyPair, setHistoryPair] = useState<[number, number]>([1, 0]);
  const [exploreTitle, setExploreTitle] = useState("최근 변경");

  const document = documents.find((item) => item.id === selectedId) ?? documents[0];
  const toc = useMemo(() => document ? extractToc(document.content) : [], [document]);
  const backlinks = useMemo(() => document ? getBacklinks(document, documents) : [], [document, documents]);

  useEffect(() => {
    if (!selectedId && documents[0]) setSelectedId(documents[0].id);
  }, [documents, selectedId]);

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "wiki" && segments[1] && segments[1] !== "new") {
      const found = resolveWikiDocument(decodeURIComponent(segments.slice(1).join("/")), documents);
      if (found) { setSelectedId(found.id); setView("read"); }
      return;
    }
    if (pathname === "/wikifier") { setView("wikifier"); return; }
    if (pathname === "/new" || (segments[0] === "wiki" && segments[1] === "new")) {
      const requestedTitle = searchParams.get("title")?.trim() || "새 사내 지식";
      const existing = resolveWikiDocument(requestedTitle, documents);
      const draft = existing ?? createDocument({ title: requestedTitle, content: `# 개요\n\n${requestedTitle} 문서의 목적과 적용 범위를 입력하세요.\n\n## 제원\n\n- 핵심 데이터를 입력하세요.\n\n## 트러블\n\n- 현장 사례를 입력하세요.\n\n## 실무 꿀팁\n\n- 재사용할 노하우를 입력하세요.`, categories: ["신규 문서"] });
      setSelectedId(draft.id); setView("edit"); return;
    }
    const explorer: Record<string, string> = { "/recent": "최근 변경", "/favorites": "즐겨찾기", "/categories": "분류 탐색", "/graph": "지식 그래프", "/people": "실무자 디렉터리" };
    if (explorer[pathname]) { setExploreTitle(explorer[pathname]); setView("explore"); return; }
    if (pathname.startsWith("/category/")) { setExploreTitle(pathname.includes("regulations") ? "사내 규정" : "플랜트 설비"); setView("explore"); return; }
    if (pathname === "/random") {
      const next = documents[Math.floor(Math.random() * documents.length)];
      if (next) router.replace(`/wiki/${encodeURIComponent(next.slug)}`);
      return;
    }
    if (pathname === "/") setView("read");
  }, [createDocument, documents, pathname, router, searchParams]);

  if (!document) return null;

  const selectDocument = (next: WikiDocument) => {
    setSelectedId(next.id);
    setView("read");
    router.push(`/wiki/${encodeURIComponent(next.slug)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWikiClick = (event: MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[data-wiki-target]");
    if (!anchor) return;
    event.preventDefault();
    const target = anchor.dataset.wikiTarget ?? "";
    const found = resolveWikiDocument(target, documents);
    if (found) selectDocument(found);
    else {
      const draft = createDocument({
        title: target,
        content: `# 개요\n\n${target}에 대한 신규 문서입니다.\n\n## 제원\n\n- 내용을 입력해 주세요.\n\n## 트러블\n\n- 현장 사례를 입력해 주세요.\n\n## 실무 꿀팁\n\n- 경험 지식을 입력해 주세요.`,
        categories: ["미분류", "신규 문서"],
      });
      setSelectedId(draft.id);
      setView("edit");
      router.push(`/wiki/new?title=${encodeURIComponent(target)}`);
    }
  };

  const shellToc = toc.map((item) => ({
    id: item.id,
    label: item.title,
    number: item.index,
    depth: Math.min(3, item.level) as 1 | 2 | 3,
  }));

  const infoboxRows = document.infobox?.rows.map((row) => ({ label: row.label, value: row.value })) ?? [
    { label: "문서 분류", value: document.categories[0] ?? "사내 지식" },
    { label: "담당 조직", value: document.author.department },
    { label: "검증 상태", value: "기술 검토 완료" },
    { label: "현재 버전", value: `v${document.version}` },
  ];

  return (
    <WikiShell
      toc={shellToc}
      breadcrumbs={[{ label: "넥서스" }, { label: document.categories[0] ?? "지식" }, { label: document.title }]}
    >
      <SearchPanel documents={documents} onSelect={selectDocument} />

      {view === "wikifier" ? (
        <section className="tool-page">
          <button className="wiki-button" onClick={() => setView("read")}><ArrowLeft size={14} /> 문서로 돌아가기</button>
          <div className="tool-page__heading"><Sparkles /><div><span>지식 자동화</span><h1>AI 위키 변환</h1><p>산재한 현장 기록을 재사용 가능한 구조적 지식으로 전환합니다.</p></div></div>
          <WikifierDropzone
            knownDocuments={documents.map((item) => item.title)}
            onWikified={(content) => {
              const title = /^#\s+(.+)$/m.exec(content)?.[1] ?? "AI 위키 변환 초안";
              const draft = createDocument({ title, content, categories: ["AI 초안", "현장 지식"] });
              setSelectedId(draft.id);
              setView("edit");
            }}
          />
        </section>
      ) : view === "explore" ? (
        <section className="tool-page explore-page">
          <div className="tool-page__heading"><Network /><div><span>지식 탐색</span><h1>{exploreTitle}</h1><p>조직의 지식 노드를 사람, 설비, 규정과 함께 탐색합니다.</p></div></div>
          <div className="explore-stats"><span><b>{documents.length}</b> 전체 문서</span><span><b>{new Set(documents.flatMap((item) => item.categories)).size}</b> 분류</span><span><b>{documents.reduce((sum, item) => sum + item.revisions.length, 0)}</b> 리비전</span></div>
          <div className="explore-list">{[...documents].sort((a,b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).map((item) => <button key={item.id} onClick={() => selectDocument(item)}><span className="backlink-icon"><BookOpen size={16}/></span><span><b>{item.title}</b><small>{item.summary}</small></span><em>{item.categories[0]}</em><time>v{item.version}</time></button>)}</div>
        </section>
      ) : view === "edit" ? (
        <section className="tool-page">
          <button className="wiki-button" onClick={() => setView("read")}><ArrowLeft size={14} /> 읽기로 돌아가기</button>
          <EditorPanel
            key={`${document.id}-${document.version}`}
            title={`${document.title} 편집`}
            initialContent={document.content}
            revisions={toEditorRevisions(document)}
            dictionary={documents.map((item) => item.title)}
            onCancel={() => setView("read")}
            onSave={(content, summary) => { updateDocument(document.id, content, summary); setView("read"); }}
            onRollback={(revision) => { rollbackDocument(document.id, revision.id); setView("read"); }}
          />
        </section>
      ) : view === "history" ? (
        <section className="tool-page revision-page">
          <button className="wiki-button" onClick={() => setView("read")}><ArrowLeft size={14} /> 문서로 돌아가기</button>
          <div className="tool-page__heading"><GitCompareArrows /><div><span>버전 관리</span><h1>{document.title}의 역사</h1><p>{document.revisions.length}개 버전 · 현재 v{document.version}</p></div></div>
          <div className="revision-picker">
            {document.revisions.map((revision, index) => (
              <button key={revision.id} className={historyPair.includes(index) ? "is-selected" : ""} onClick={() => setHistoryPair(([left]) => [index, left === index ? 0 : left])}>
                <b>v{revision.version}</b><span>{revision.summary}</span><small>{revision.author.name} · {dateTime.format(new Date(revision.createdAt))}</small>
              </button>
            ))}
          </div>
          <DiffViewer
            before={document.revisions[historyPair[0]]?.content ?? document.content}
            after={document.revisions[historyPair[1]]?.content ?? document.content}
            beforeLabel={`v${document.revisions[historyPair[0]]?.version ?? document.version}`}
            afterLabel={`v${document.revisions[historyPair[1]]?.version ?? document.version}`}
          />
        </section>
      ) : (
        <article className="wiki-document" onClick={handleWikiClick}>
          <header className="wiki-title-row">
            <div className="wiki-title">
              <div className="document-kicker"><Activity size={13} /> 검증된 운영 지식</div>
              <h1>{document.title}</h1>
              <p>{document.summary}</p>
            </div>
            <div className="wiki-title-actions">
              <button className="wiki-button wiki-button--primary" onClick={() => setView("edit")}><Edit3 size={14} /> 편집</button>
              <button className="wiki-button" onClick={() => setView("history")}><Clock3 size={14} /> 역사</button>
              <button className="wiki-button" onClick={() => setView("wikifier")}><Sparkles size={14} /> AI 변환</button>
            </div>
          </header>

          <div className="wiki-meta">
            <span><Clock3 size={13} /> 최근 수정 {dateTime.format(new Date(document.updatedAt))}</span>
            <span><Edit3 size={13} /> {document.author.name} · {document.author.department}</span>
            <span><Eye size={13} /> {document.viewCount.toLocaleString()}회</span>
            <span><ShieldCheck size={13} /> v{document.version}</span>
            {document.categories.map((category) => <span className="category-badge" key={category}>{category}</span>)}
          </div>

          <div className="mobile-toc">
            <b>목차</b>{toc.map((item) => <a href={`#${item.id}`} key={item.id}>{item.index}. {item.title}</a>)}
          </div>

          <div className="wiki-article-grid">
            <div>
              <WikiRenderer content={document.content} documents={documents} className="wiki-prose" />

              <section className="backlinks-panel">
                <header><div><Link2 size={18} /><span><b>역링크 탐색기</b><small>이 문서를 인용한 지식</small></span></div><em>인용 {backlinks.length}건</em></header>
                {backlinks.length ? backlinks.map((item) => (
                  <button key={item.id} onClick={() => selectDocument(item)}>
                    <span className="backlink-icon"><BookOpen size={16} /></span>
                    <span><b>{item.title}</b><small>{item.summary}</small></span>
                    <span className="backlink-category">{item.categories[0]}</span>
                  </button>
                )) : <p className="backlinks-empty">아직 이 문서를 인용한 문서가 없습니다.</p>}
              </section>
            </div>

            <div className="infobox-stack">
              <Infobox
                title={document.infobox?.title ?? document.title}
                subtitle={document.infobox?.subtitle ?? document.summary}
                eyebrow={document.categories.includes("인물") ? "분야별 전문가" : "플랜트 지식 항목"}
                image={<AssetSketch title={document.title} />}
                status={document.categories.includes("규정") ? "현행 규정" : "검증 완료"}
                rows={infoboxRows}
                footer={<span><ShieldCheck size={12} /> 사내 기술위원 검증 · 데이터 기준 2026.08</span>}
              />
              <div className="graph-card"><header><Network size={16} /><b>지식 연결망</b></header><div className="graph-nodes"><span>안전</span><strong>{document.title.slice(0, 8)}</strong><span>정비</span><span>공정</span></div><p><Users size={13} /> {backlinks.length + 4}명의 엔지니어가 최근 열람</p></div>
            </div>
          </div>
        </article>
      )}
    </WikiShell>
  );
}
