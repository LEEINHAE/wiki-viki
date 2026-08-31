import React, { Fragment, type ReactNode } from "react";
import type { TocItem, WikiDocument, WikiInlineToken, WikifyOptions } from "../types/wiki";

const wikiLinkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const inlinePattern = /(\[\[[^\]]+\]\]|~~[^~]+~~|\[\^[^\]]+\])/g;

export const normalizeWikiKey = (value: string): string =>
  decodeURIComponent(value).trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");

export const headingId = (title: string): string =>
  title
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, "$2$1")
    .replace(/[*_~`]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ-]/g, "")
    .toLocaleLowerCase("ko-KR");

export const resolveWikiDocument = (
  target: string,
  documents: readonly WikiDocument[],
): WikiDocument | undefined => {
  const key = normalizeWikiKey(target);
  return documents.find((document) =>
    [document.title, document.slug, ...document.aliases].some(
      (candidate) => normalizeWikiKey(candidate) === key,
    ),
  );
};

export const parseInlineWiki = (
  source: string,
  documents: readonly WikiDocument[],
): WikiInlineToken[] => {
  const tokens: WikiInlineToken[] = [];
  let cursor = 0;
  inlinePattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = inlinePattern.exec(source)) !== null) {
    const index = match.index ?? 0;
    if (index > cursor) tokens.push({ type: "text", value: source.slice(cursor, index) });
    const raw = match[0];
    if (raw.startsWith("[[")) {
      const inner = raw.slice(2, -2);
      const separator = inner.indexOf("|");
      const target = (separator >= 0 ? inner.slice(0, separator) : inner).trim();
      const label = (separator >= 0 ? inner.slice(separator + 1) : target).trim();
      const found = resolveWikiDocument(target, documents);
      tokens.push({ type: "link", target, label, exists: Boolean(found), slug: found?.slug });
    } else if (raw.startsWith("~~")) {
      tokens.push({ type: "strike", value: raw.slice(2, -2) });
    } else {
      const inner = raw.slice(2, -1);
      const separator = inner.indexOf(":");
      tokens.push({
        type: "footnote",
        id: (separator >= 0 ? inner.slice(0, separator) : inner).trim(),
        value: (separator >= 0 ? inner.slice(separator + 1) : inner).trim(),
      });
    }
    cursor = index + raw.length;
  }
  if (cursor < source.length) tokens.push({ type: "text", value: source.slice(cursor) });
  return tokens;
};

export const extractToc = (markdown: string): TocItem[] => {
  const headings = markdown
    .split(/\r?\n/)
    .map((line) => /^(#{1,4})\s+(.+?)\s*$/.exec(line))
    .filter((match): match is RegExpExecArray => Boolean(match));
  const counters = [0, 0, 0, 0];
  return headings.map((match) => {
    const level = match[1]!.length;
    counters[level - 1] += 1;
    for (let index = level; index < counters.length; index += 1) counters[index] = 0;
    const title = match[2]!.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_raw, target: string, label?: string) => label ?? target).replace(/[*_~`]/g, "");
    return { id: headingId(title), title, level, index: counters.slice(0, level).filter(Boolean).join(".") };
  });
};

export const extractWikiTargets = (markdown: string): string[] => {
  const targets = new Set<string>();
  wikiLinkPattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = wikiLinkPattern.exec(markdown)) !== null) {
    if (match[1]) targets.add(match[1].trim());
  }
  return Array.from(targets);
};

export const getBacklinks = (
  target: string | WikiDocument,
  documents: readonly WikiDocument[],
): WikiDocument[] => {
  const targetDocument = typeof target === "string" ? resolveWikiDocument(target, documents) : target;
  const accepted = new Set(
    [targetDocument?.title ?? (typeof target === "string" ? target : ""), targetDocument?.slug ?? "", ...(targetDocument?.aliases ?? [])]
      .filter(Boolean)
      .map(normalizeWikiKey),
  );
  return documents.filter(
    (document) => document.id !== targetDocument?.id && extractWikiTargets(document.content).some((link) => accepted.has(normalizeWikiKey(link))),
  );
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const autoLinkText = (
  text: string,
  documentsOrDictionary: readonly WikiDocument[] | readonly string[],
): string => {
  const terms = (typeof documentsOrDictionary[0] === "string"
    ? (documentsOrDictionary as readonly string[])
    : (documentsOrDictionary as readonly WikiDocument[]).flatMap((document) => [document.title, ...document.aliases]))
    .filter((term) => term.trim().length >= 2)
    .sort((left, right) => right.length - left.length);
  if (terms.length === 0) return text;
  const expression = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const protectedSegments = text.split(/(```[\s\S]*?```|`[^`]+`|\[\[[^\]]+\]\])/g);
  return protectedSegments
    .map((segment) => {
      if (segment.startsWith("[[") || segment.startsWith("`")) return segment;
      return segment.replace(expression, (match, _term: string, offset: number, whole: string) => {
        const previous = whole[offset - 1] ?? "";
        const next = whole[offset + match.length] ?? "";
        if (/[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]/.test(previous) || /[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]/.test(next)) return match;
        return `[[${match}]]`;
      });
    })
    .join("");
};

export const wikifyText = (rawText: string, options: WikifyOptions = {}): string => {
  const normalized = rawText.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "# 개요\n내용을 입력하세요.\n\n## 제원\n- 확인 필요\n\n## 트러블\n- 확인 필요\n\n## 실무 꿀팁\n- 확인 필요";
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  const section = (keywords: readonly string[]): string[] => lines.filter((line) => keywords.some((keyword) => line.toLocaleLowerCase("ko-KR").includes(keyword)));
  const specifications = section(["압력", "온도", "유량", "용량", "재질", "rpm", "kw", "사양", "제원"]);
  const troubles = section(["고장", "문제", "누설", "진동", "이상", "트러블", "alarm", "경보"]);
  const tips = section(["팁", "주의", "권장", "먼저", "확인", "노하우"]);
  const used = new Set([...specifications, ...troubles, ...tips]);
  const overview = lines.filter((line) => !used.has(line));
  const bullets = (items: readonly string[], fallback: string): string =>
    (items.length ? items : [fallback]).map((item) => `- ${item.replace(/^[-*]\s*/, "")}`).join("\n");
  const title = options.title ? `# ${options.title}\n\n` : "";
  const result = `${title}# 개요\n${overview.join("\n") || `${options.equipmentType ?? "대상"}에 대한 현장 메모를 구조화한 문서다.`}\n\n## 제원\n${bullets(specifications, "상세 제원 확인 필요")}\n\n## 트러블\n${bullets(troubles, "현재 등록된 트러블 없음")}\n\n## 실무 꿀팁\n${bullets(tips, "현장 경험을 추가해 주세요.")}`;
  return options.dictionary ? autoLinkText(result, options.dictionary) : result;
};

const renderInline = (source: string, documents: readonly WikiDocument[]): ReactNode[] =>
  parseInlineWiki(source, documents).map((token, index) => {
    const key = `${token.type}-${index}`;
    if (token.type === "link") {
      const href = token.exists ? `/wiki/${encodeURIComponent(token.slug ?? token.target)}` : `/wiki/new?title=${encodeURIComponent(token.target)}`;
      return <a key={key} href={href} className={token.exists ? "wiki-link" : "wiki-link wiki-redlink"} data-wiki-target={token.target} data-exists={token.exists}>{token.label}</a>;
    }
    if (token.type === "strike") return <del key={key}>{token.value}</del>;
    if (token.type === "footnote") return <sup key={key} className="wiki-footnote" title={token.value || `각주 ${token.id}`} tabIndex={0}>[{token.id}]<span role="tooltip">{token.value || `각주 ${token.id}`}</span></sup>;
    const fragments = token.value.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return <Fragment key={key}>{fragments.map((fragment, part) => fragment.startsWith("**") ? <strong key={part}>{fragment.slice(2, -2)}</strong> : fragment.startsWith("`") ? <code key={part}>{fragment.slice(1, -1)}</code> : fragment)}</Fragment>;
  });

export interface WikiRendererProps {
  content: string;
  documents: readonly WikiDocument[];
  className?: string;
}

export const WikiRenderer = ({ content, documents, className }: WikiRendererProps): React.JSX.Element => {
  const lines = content.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index]!;
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      const title = heading[2]!;
      nodes.push(React.createElement(`h${level}`, { key: index, id: headingId(title) }, renderInline(title, documents)));
      index += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index]!)) items.push(lines[index++]!.replace(/^[-*]\s+/, ""));
      nodes.push(<ul key={`ul-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, documents)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index]!)) items.push(lines[index++]!.replace(/^\d+\.\s+/, ""));
      nodes.push(<ol key={`ol-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, documents)}</li>)}</ol>);
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (index < lines.length && lines[index]!.startsWith("|")) rows.push(lines[index++]!.split("|").slice(1, -1).map((cell) => cell.trim()));
      const cleanRows = rows.filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
      const [headers, ...body] = cleanRows;
      if (headers) nodes.push(<div className="wiki-table-wrap" key={`table-${index}`}><table><thead><tr>{headers.map((cell, cellIndex) => <th key={cellIndex}>{renderInline(cell, documents)}</th>)}</tr></thead><tbody>{body.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{renderInline(cell, documents)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (line.startsWith("> ")) nodes.push(<blockquote key={index}>{renderInline(line.slice(2), documents)}</blockquote>);
    else if (line.trim()) nodes.push(<p key={index}>{renderInline(line, documents)}</p>);
    index += 1;
  }
  return <article className={className}>{nodes}</article>;
};

export const renderWikiContent = (content: string, documents: readonly WikiDocument[]): React.JSX.Element =>
  <WikiRenderer content={content} documents={documents} />;
