"use client";

import { useMemo, useState } from "react";
import { Columns2, FileDiff, Minus, Plus } from "lucide-react";

export type DiffViewerProps = {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
};

type DiffLine = {
  kind: "same" | "added" | "removed";
  value: string;
  oldLine?: number;
  newLine?: number;
};

function createLineDiff(before: string, after: string): DiffLine[] {
  const left = before.replace(/\r\n/g, "\n").split("\n");
  const right = after.replace(/\r\n/g, "\n").split("\n");
  const matrix = Array.from({ length: left.length + 1 }, () =>
    new Uint32Array(right.length + 1),
  );

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      matrix[i][j] =
        left[i] === right[j]
          ? matrix[i + 1][j + 1] + 1
          : Math.max(matrix[i + 1][j], matrix[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oldLine = 1;
  let newLine = 1;
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      result.push({ kind: "same", value: left[i], oldLine, newLine });
      i += 1;
      j += 1;
      oldLine += 1;
      newLine += 1;
    } else if (j < right.length && (i === left.length || matrix[i][j + 1] >= matrix[i + 1][j])) {
      result.push({ kind: "added", value: right[j], newLine });
      j += 1;
      newLine += 1;
    } else {
      result.push({ kind: "removed", value: left[i], oldLine });
      i += 1;
      oldLine += 1;
    }
  }
  return result;
}

export function DiffViewer({
  before,
  after,
  beforeLabel = "이전 버전",
  afterLabel = "현재 편집본",
  className = "",
}: DiffViewerProps) {
  const [showUnchanged, setShowUnchanged] = useState(true);
  const lines = useMemo(() => createLineDiff(before, after), [before, after]);
  const visibleLines = showUnchanged ? lines : lines.filter((line) => line.kind !== "same");
  const additions = lines.filter((line) => line.kind === "added").length;
  const deletions = lines.filter((line) => line.kind === "removed").length;

  return (
    <section className={`overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/70">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          <FileDiff className="h-4 w-4 text-emerald-600" />
          <span className="truncate">{beforeLabel}</span>
          <span className="text-zinc-400">→</span>
          <span className="truncate">{afterLabel}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><Plus className="h-3.5 w-3.5" />{additions}</span>
          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400"><Minus className="h-3.5 w-3.5" />{deletions}</span>
          <button
            type="button"
            onClick={() => setShowUnchanged((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-zinc-600 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <Columns2 className="h-3.5 w-3.5" />
            {showUnchanged ? "변경만 보기" : "전체 보기"}
          </button>
        </div>
      </header>

      <div className="max-h-[520px] overflow-auto font-mono text-[13px] leading-6" role="table" aria-label="문서 변경 사항">
        {visibleLines.length === 0 ? (
          <div className="px-4 py-12 text-center font-sans text-sm text-zinc-500">변경된 내용이 없습니다.</div>
        ) : (
          visibleLines.map((line, index) => {
            const style = line.kind === "added"
              ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-100"
              : line.kind === "removed"
                ? "bg-rose-50 text-rose-950 dark:bg-rose-950/35 dark:text-rose-100"
                : "text-zinc-700 dark:text-zinc-300";
            return (
              <div key={`${index}-${line.kind}`} className={`grid min-w-max grid-cols-[3.25rem_3.25rem_1.5rem_minmax(0,1fr)] border-b border-zinc-100 last:border-0 dark:border-zinc-800 ${style}`} role="row">
                <span className="select-none border-r border-zinc-200 px-2 text-right text-zinc-400 dark:border-zinc-700">{line.oldLine ?? ""}</span>
                <span className="select-none border-r border-zinc-200 px-2 text-right text-zinc-400 dark:border-zinc-700">{line.newLine ?? ""}</span>
                <span className="select-none text-center font-bold" aria-hidden>{line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}</span>
                <span className="whitespace-pre-wrap break-all pr-4">{line.value || " "}</span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default DiffViewer;
