import { WikiApp } from "@/components/wiki-app";

export default async function WikiRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const initialTarget = slug[0] === "wiki" && slug[1] && slug[1] !== "new" ? decodeURIComponent(slug.slice(1).join("/")) : undefined;
  return <WikiApp initialTarget={initialTarget} />;
}
