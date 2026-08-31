"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Bot,
  Check,
  Clock3,
  Eye,
  FileDiff,
  History,
  PencilLine,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { DiffViewer } from "./diff-viewer";

export type WikiRevision = {
  id: string;
  version: string;
  content: string;
  summary: string;
  author: string;
  createdAt: string;
};

export type EditorPanelProps = {
  title?: string;
  initialContent: string;
  revisions?: WikiRevision[];
  dictionary?: string[];
  onSave?: (content: string, summary: string) => void | Promise<void>;
  onRollback?: (revision: WikiRevision) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
};

type Tab = "edit" | "preview" | "diff" | "history";

const tabItems: Array<{ id: Tab; label: string; icon: typeof PencilLine }> = [
  { id: "edit", label: "편집", icon: PencilLine },
  { id: "preview", label: "미리보기", icon: Eye },
  { id: "diff", label: "변경사항", icon: FileDiff },
  { id: "history", label: "역사", icon: History },
];

function applyAutoLinks(source: string, dictionary: string[]) {
  return dictionary.reduce((text, keyword) => {
    if (!keyword.trim()) return text;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<!\\[\\[)${escaped}(?![^\\[]*\\]\\])`, "g");
    return text.replace(pattern, `[[${keyword}]]`);
  }, source);
}

function InlineWikiText({ text }: { text: string }) {
  const tokens = text.split(/(\[\[[^\]]+\]\]|~~[^~]+~~|\*\*[^*]+\*\*)/g);
  return (
    <>
      {tokens.map((token, index) => {
        if (token.startsWith("[[") && token.endsWith("]]")) {
          return <a key={index} className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 dark:text-emerald-400">{token.slice(2, -2)}</a>;
        }
        if (token.startsWith("~~") && token.endsWith("~~")) return <del key={index} className="text-zinc-500">{token.slice(2, -2)}</del>;
        if (token.startsWith("**") && token.endsWith("**")) return <strong key={index}>{token.slice(2, -2)}</strong>;
        return <Fragment key={index}>{token}</Fragment>;
      })}
    </>
  );
}

function WikiPreview({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  return (
    <article className="min-h-[420px] space-y-3 px-5 py-6 text-[15px] leading-7 text-zinc-800 dark:text-zinc-200">
      {lines.map((line, index) => {
        const heading = /^(#{1,4})\s+(.+)$/.exec(line);
        if (heading) {
          const level = heading[1].length;
          const size = level === 1 ? "text-2xl" : level === 2 ? "text-xl" : "text-lg";
          return <div key={index} className={`${size} mt-7 border-b border-zinc-300 pb-2 font-bold first:mt-0 dark:border-zinc-700`}><InlineWikiText text={heading[2]} /></div>;
        }
        if (/^[-*]\s+/.test(line)) return <div key={index} className="flex gap-2 pl-3"><span className="text-emerald-600">•</span><span><InlineWikiText text={line.replace(/^[-*]\s+/, "")} /></span></div>;
        if (/^>\s?/.test(line)) return <blockquote key={index} className="border-l-4 border-emerald-500 bg-zinc-50 px-4 py-2 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"><InlineWikiText text={line.replace(/^>\s?/, "")} /></blockquote>;
        return line ? <p key={index}><InlineWikiText text={line} /></p> : <div key={index} className="h-2" />;
      })}
    </article>
  );
}

export function EditorPanel({
  title = "문서 편집",
  initialContent,
  revisions = [],
  dictionary = ["열교환기", "원심펌프", "LOTO", "설비보전", "안전작업허가서"],
  onSave,
  onRollback,
  onCancel,
  className = "",
}: EditorPanelProps) {
  const [tab, setTab] = useState<Tab>("edit");
  const [content, setContent] = useState(initialContent);
  const [summary, setSummary] = useState("");
  const [autoLink, setAutoLink] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<WikiRevision | null>(null);
  const changed = content !== initialContent;
  const charDelta = content.length - initialContent.length;
  const effectivePreview = useMemo(() => autoLink ? applyAutoLinks(content, dictionary) : content, [autoLink, content, dictionary]);

  async function save() {
    if (!changed || saving) return;
    setSaving(true);
    try {
      await onSave?.(effectivePreview, summary.trim() || "내용 업데이트");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  async function rollback(revision: WikiRevision) {
    setContent(revision.content);
    setSummary(`${revision.version} 버전으로 되돌림`);
    setTab("diff");
    setSelectedRevision(null);
    await onRollback?.(revision);
  }

  return (
    <section className={`overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${className}`}>
      <header className="border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white"><PencilLine className="h-5 w-5 text-emerald-600" />{title}</div>
            <p className="mt-1 text-xs text-zinc-500">Markdown과 <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">[[위키 링크]]</code> 문법을 지원합니다.</p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />자동 링크
            <input className="peer sr-only" type="checkbox" checked={autoLink} onChange={(event) => setAutoLink(event.target.checked)} />
            <span className="relative h-5 w-9 rounded-full bg-zinc-300 transition peer-checked:bg-emerald-600 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4 dark:bg-zinc-600" />
          </label>
        </div>
        <nav className="flex overflow-x-auto px-3" aria-label="편집 화면">
          {tabItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`relative flex min-w-max items-center gap-1.5 px-4 py-3 text-sm font-semibold transition ${tab === item.id ? "text-emerald-700 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-emerald-600 dark:text-emerald-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}><Icon className="h-4 w-4" />{item.label}{item.id === "diff" && changed && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}</button>;
          })}
        </nav>
      </header>

      {tab === "edit" && (
        <div>
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="inline-flex items-center gap-1.5"><Bot className="h-3.5 w-3.5 text-violet-500" />키워드 {dictionary.length}개를 사내 사전과 대조 중</span>
            <span>{content.length.toLocaleString()}자 · {content.split(/\s+/).filter(Boolean).length.toLocaleString()}단어</span>
          </div>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} spellCheck={false} aria-label="위키 본문" className="min-h-[460px] w-full resize-y bg-white px-5 py-5 font-mono text-sm leading-7 text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 dark:bg-zinc-900 dark:text-zinc-100" placeholder="# 개요\n문서 내용을 입력하세요." />
        </div>
      )}
      {tab === "preview" && <WikiPreview content={effectivePreview} />}
      {tab === "diff" && <div className="p-4"><DiffViewer before={initialContent} after={effectivePreview} /></div>}
      {tab === "history" && (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {revisions.length === 0 ? <div className="px-5 py-16 text-center text-sm text-zinc-500"><History className="mx-auto mb-3 h-8 w-8 text-zinc-300" />아직 저장된 이전 버전이 없습니다.</div> : revisions.map((revision, index) => (
            <div key={revision.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <div className="flex min-w-0 gap-3">
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${index === 0 ? "bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                <div className="min-w-0"><div className="flex items-center gap-2"><strong className="text-sm text-zinc-900 dark:text-white">{revision.version}</strong>{index === 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">현재</span>}</div><p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-300">{revision.summary}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400"><Clock3 className="h-3 w-3" />{revision.createdAt} · {revision.author}</p></div>
              </div>
              <div className="flex gap-2"><button type="button" onClick={() => setSelectedRevision(revision)} className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-600 dark:text-zinc-300">비교</button>{index !== 0 && <button type="button" onClick={() => void rollback(revision)} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-amber-500 hover:text-amber-700 dark:border-zinc-600 dark:text-zinc-300"><RotateCcw className="h-3.5 w-3.5" />롤백</button>}</div>
            </div>
          ))}
        </div>
      )}

      <footer className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
        <div className="mb-3 flex items-center gap-2"><input value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={120} placeholder="변경 요약 (예: 정비 주기 최신화)" className="h-10 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white" /><span className="hidden text-xs text-zinc-400 sm:block">{summary.length}/120</span></div>
        <div className="flex flex-wrap items-center justify-between gap-3"><span className={`text-xs font-medium ${changed ? "text-amber-600" : "text-zinc-400"}`}>{changed ? `저장되지 않은 변경 · ${charDelta >= 0 ? "+" : ""}${charDelta}자` : "모든 변경사항 저장됨"}</span><div className="flex gap-2">{onCancel && <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700">취소</button>}<button type="button" onClick={() => void save()} disabled={!changed || saving} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45">{saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saving ? "저장 중…" : saved ? "저장 완료" : "변경사항 저장"}</button></div></div>
      </footer>

      {selectedRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${selectedRevision.version} 비교`}>
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-4 shadow-2xl dark:bg-zinc-900"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold text-zinc-900 dark:text-white">{selectedRevision.version} 비교</h3><p className="text-xs text-zinc-500">{selectedRevision.author} · {selectedRevision.createdAt}</p></div><button type="button" onClick={() => setSelectedRevision(null)} className="rounded-md px-3 py-2 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">닫기</button></div><DiffViewer before={selectedRevision.content} after={content} beforeLabel={selectedRevision.version} afterLabel="편집본" /></div>
        </div>
      )}
    </section>
  );
}

export default EditorPanel;
