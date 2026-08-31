export interface WikiUser {
  id: string;
  name: string;
  department: string;
  role: string;
  avatar?: string;
}

export interface InfoboxRow {
  label: string;
  value: string;
  link?: string;
}

export interface WikiInfobox {
  title: string;
  subtitle?: string;
  image?: string;
  accent?: string;
  rows: InfoboxRow[];
}

export interface WikiRevision {
  id: string;
  version: string;
  content: string;
  summary: string;
  author: WikiUser;
  createdAt: string;
}

export interface WikiDocument {
  id: string;
  slug: string;
  title: string;
  aliases: string[];
  summary: string;
  content: string;
  categories: string[];
  tags: string[];
  author: WikiUser;
  updatedAt: string;
  version: string;
  infobox?: WikiInfobox;
  revisions: WikiRevision[];
  viewCount: number;
}

export interface TocItem {
  id: string;
  title: string;
  level: number;
  index: string;
}

export type WikiInlineToken =
  | { type: "text"; value: string }
  | { type: "link"; target: string; label: string; slug?: string; exists: boolean }
  | { type: "strike"; value: string }
  | { type: "footnote"; id: string; value: string };

export interface WikifyOptions {
  title?: string;
  equipmentType?: string;
  dictionary?: readonly string[];
}
