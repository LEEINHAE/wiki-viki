"use client";

import { DragEvent, useRef, useState } from "react";
import { Bot, FileText, Link2, Loader2, Sparkles, UploadCloud, X } from "lucide-react";

export type WikifierDropzoneProps = {
  onWikified: (content: string) => void;
  knownDocuments?: string[];
  disabled?: boolean;
  className?: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function autoLink(text: string, documents: string[]) {
  return [...documents]
    .sort((a, b) => b.length - a.length)
    .reduce((result, document) => result.replace(new RegExp(`(?<!\\[\\[)${escapeRegExp(document)}(?![^\\[]*\\]\\])`, "g"), `[[${document}]]`), text);
}

function wikify(raw: string, documents: string[], shouldLink: boolean) {
  const cleaned = raw.trim().replace(/\r\n/g, "\n");
  const lines = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);
  const title = lines[0]?.replace(/^#+\s*/, "").slice(0, 60) || "새 업무 지식";
  const body = lines.slice(1).map((line) => /^[-*]\s/.test(line) ? line : `- ${line}`).join("\n") || "- 내용을 보완해 주세요.";
  const template = `# ${title}\n\n> 이 문서는 현장 메모를 AI 위키파이어로 구조화한 초안입니다. 검토 후 확정해 주세요.\n\n## 1. 개요\n${body}\n\n## 2. 제원\n| 항목 | 내용 |\n| --- | --- |\n| 설비/업무 | ${title} |\n| 담당 조직 | 확인 필요 |\n| 적용 범위 | 확인 필요 |\n\n## 3. 트러블 및 조치 이력\n- **증상:** 원문 메모를 기준으로 보완 필요\n- **원인:** 현장 확인 필요\n- **조치:** 표준 작업 절차에 따라 기록\n\n## 4. 실무 꿀팁\n- 작업 전 [[안전작업허가서]]와 [[LOTO]] 절차를 확인한다.\n- 변경된 제원과 정비 이력은 작업 직후 갱신한다.\n\n## 5. 관련 문서\n- [[설비보전]]\n- [[안전관리규정]]`;
  return shouldLink ? autoLink(template, documents) : template;
}

export function WikifierDropzone({
  onWikified,
  knownDocuments = ["열교환기", "원심펌프", "안전작업허가서", "LOTO", "설비보전", "안전관리규정"],
  disabled = false,
  className = "",
}: WikifierDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [memo, setMemo] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [working, setWorking] = useState(false);
  const [useAutoLink, setUseAutoLink] = useState(true);

  async function loadFile(file: File) {
    if (!file.type.startsWith("text/") && !/\.(md|txt|csv|log)$/i.test(file.name)) return;
    setMemo(await file.text());
    setFileName(file.name);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void loadFile(file);
    else {
      const text = event.dataTransfer.getData("text/plain");
      if (text) setMemo(text);
    }
  }

  async function transform() {
    if (!memo.trim() || working) return;
    setWorking(true);
    await new Promise((resolve) => window.setTimeout(resolve, 520));
    onWikified(wikify(memo, knownDocuments, useAutoLink));
    setWorking(false);
  }

  return (
    <section className={`rounded-xl border border-violet-200 bg-gradient-to-br from-white via-white to-violet-50 p-5 shadow-sm dark:border-violet-900 dark:from-zinc-900 dark:via-zinc-900 dark:to-violet-950/30 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white"><span className="rounded-lg bg-violet-100 p-2 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Bot className="h-5 w-5" /></span>AI 위키파이어 <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-extrabold text-violet-700 dark:bg-violet-950 dark:text-violet-300">BETA</span></div><p className="mt-2 text-sm text-zinc-500">업무 일지나 거친 메모를 넣으면 사내 위키 표준 초안으로 정리합니다.</p></div>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300"><Link2 className="h-3.5 w-3.5 text-emerald-600" />용어 자동 링크<input type="checkbox" checked={useAutoLink} onChange={(event) => setUseAutoLink(event.target.checked)} className="h-4 w-4 accent-emerald-600" /></label>
      </div>

      <div onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={handleDrop} className={`relative rounded-lg border-2 border-dashed transition ${dragging ? "border-violet-500 bg-violet-100/70 dark:bg-violet-950/40" : "border-zinc-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/70"}`}>
        <textarea value={memo} onChange={(event) => { setMemo(event.target.value); setFileName(null); }} disabled={disabled} className="min-h-[210px] w-full resize-y bg-transparent px-4 pb-14 pt-4 text-sm leading-6 text-zinc-800 outline-none placeholder:text-zinc-400 disabled:opacity-50 dark:text-zinc-100" placeholder={'예) P-204A 진동 수치 상승. 커플링 정렬 후 2.1mm/s로 정상화.\n현장 팁: 재가동 전 흡입 밸브 개방 여부 확인.'} />
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/95">
          {fileName ? <span className="flex min-w-0 items-center gap-2 text-zinc-600 dark:text-zinc-300"><FileText className="h-4 w-4 shrink-0 text-violet-500" /><span className="truncate">{fileName}</span><button type="button" onClick={() => { setFileName(null); setMemo(""); }} aria-label="첨부 제거"><X className="h-3.5 w-3.5" /></button></span> : <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-2 font-semibold text-zinc-600 hover:text-violet-700 dark:text-zinc-300"><UploadCloud className="h-4 w-4" />TXT·MD 파일 선택 또는 드롭</button>}
          <span className="shrink-0 text-zinc-400">{memo.length.toLocaleString()}자</span>
          <input ref={inputRef} type="file" accept=".txt,.md,.csv,.log,text/plain,text/markdown" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadFile(file); }} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-1.5 text-xs text-zinc-500"><Sparkles className="h-3.5 w-3.5 text-violet-500" />개요 · 제원 · 트러블 · 실무 꿀팁 구조로 변환</p><button type="button" onClick={() => void transform()} disabled={disabled || !memo.trim() || working} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-300 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 dark:shadow-none">{working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{working ? "문서를 구조화하는 중…" : "위키 초안 만들기"}</button></div>
    </section>
  );
}

export default WikifierDropzone;
