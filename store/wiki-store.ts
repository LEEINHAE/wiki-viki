"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wikiDocuments, wikiUsers } from "../lib/wiki-data";
import { getBacklinks, normalizeWikiKey, resolveWikiDocument } from "../lib/wiki-parser";
import type { WikiDocument, WikiRevision, WikiUser } from "../types/wiki";

export type ThemeMode = "light" | "dark" | "system";

export interface WikiStore {
  documents: WikiDocument[];
  currentUser: WikiUser;
  theme: ThemeMode;
  searchQuery: string;
  setTheme: (theme: ThemeMode) => void;
  setSearchQuery: (query: string) => void;
  getDocument: (titleOrSlug: string) => WikiDocument | undefined;
  getBacklinks: (titleOrSlug: string) => WikiDocument[];
  createDocument: (input: Pick<WikiDocument, "title" | "content"> & Partial<Omit<WikiDocument, "id" | "title" | "content" | "revisions">>) => WikiDocument;
  updateDocument: (id: string, content: string, summary?: string) => void;
  rollbackDocument: (id: string, revisionId: string) => void;
  deleteDraft: (id: string) => void;
  resetToSeed: () => void;
}

const cloneSeed = (): WikiDocument[] => wikiDocuments.map((document) => ({ ...document, aliases: [...document.aliases], categories: [...document.categories], tags: [...document.tags], revisions: document.revisions.map((revision) => ({ ...revision })) }));

const nextVersion = (version: string): string => {
  const parts = version.split(".");
  const major = Number(parts[0]) || 1;
  const minor = Number(parts[1]) || 0;
  return `${major}.${minor + 1}`;
};

const makeId = (prefix: string): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? `${prefix}-${crypto.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const toSlug = (title: string): string => title.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ/-]/g, "-").replace(/-+/g, "-");

export const useWikiStore = create<WikiStore>()(
  persist(
    (set, get) => ({
      documents: cloneSeed(),
      currentUser: wikiUsers[0]!,
      theme: "system",
      searchQuery: "",
      setTheme: (theme) => set({ theme }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      getDocument: (titleOrSlug) => resolveWikiDocument(titleOrSlug, get().documents),
      getBacklinks: (titleOrSlug) => getBacklinks(titleOrSlug, get().documents),
      createDocument: (input) => {
        const existing = resolveWikiDocument(input.title, get().documents);
        if (existing) return existing;
        const now = new Date().toISOString();
        const author = input.author ?? get().currentUser;
        const version = input.version ?? "1.0";
        const id = makeId("doc");
        const firstRevision: WikiRevision = { id: makeId("rev"), version, content: input.content, summary: "문서 생성", author, createdAt: now };
        const document: WikiDocument = {
          id,
          slug: input.slug ?? toSlug(input.title),
          title: input.title.trim(),
          aliases: input.aliases ?? [],
          summary: input.summary ?? "새로 생성된 사내 지식 문서",
          content: input.content,
          categories: input.categories ?? ["미분류"],
          tags: input.tags ?? [],
          author,
          updatedAt: now,
          version,
          infobox: input.infobox,
          revisions: [firstRevision],
          viewCount: input.viewCount ?? 0,
        };
        set((state) => ({ documents: [document, ...state.documents] }));
        return document;
      },
      updateDocument: (id, content, summary = "문서 내용 수정") => set((state) => ({
        documents: state.documents.map((document) => {
          if (document.id !== id || document.content === content) return document;
          const version = nextVersion(document.version);
          const now = new Date().toISOString();
          const revision: WikiRevision = { id: makeId("rev"), version, content, summary, author: state.currentUser, createdAt: now };
          return { ...document, content, version, updatedAt: now, author: state.currentUser, revisions: [revision, ...document.revisions] };
        }),
      })),
      rollbackDocument: (id, revisionId) => set((state) => ({
        documents: state.documents.map((document) => {
          if (document.id !== id) return document;
          const target = document.revisions.find((revision) => revision.id === revisionId);
          if (!target || target.content === document.content) return document;
          const version = nextVersion(document.version);
          const now = new Date().toISOString();
          const rollbackRevision: WikiRevision = { id: makeId("rev"), version, content: target.content, summary: `${target.version} 버전으로 롤백`, author: state.currentUser, createdAt: now };
          return { ...document, content: target.content, version, updatedAt: now, author: state.currentUser, revisions: [rollbackRevision, ...document.revisions] };
        }),
      })),
      deleteDraft: (id) => set((state) => ({ documents: state.documents.filter((document) => document.id !== id || document.revisions.length > 1) })),
      resetToSeed: () => set({ documents: cloneSeed(), searchQuery: "" }),
    }),
    {
      name: "plant-wiki-store-v1",
      partialize: (state) => ({ documents: state.documents, currentUser: state.currentUser, theme: state.theme }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<WikiStore>;
        return { ...current, ...saved, documents: saved.documents?.length ? saved.documents : current.documents };
      },
    },
  ),
);

export const selectRecentDocuments = (state: WikiStore): WikiDocument[] =>
  [...state.documents].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));

export const selectSearchResults = (state: WikiStore): WikiDocument[] => {
  const query = normalizeWikiKey(state.searchQuery);
  if (!query) return [];
  return state.documents.filter((document) =>
    [document.title, document.summary, ...document.aliases, ...document.tags].some((value) => normalizeWikiKey(value).includes(query)),
  );
};
