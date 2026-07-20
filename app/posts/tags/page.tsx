import { getAllTags } from "@/lib/wordpress";
import { ArchiveList } from "@/components/archive-list";
import type { Tag } from "@/lib/wordpress.d";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "태그",
  description: "태그별로 관련 글을 찾아보세요.",
  alternates: {
    canonical: "/posts/tags",
  },
};

export default async function Page() {
  const tags = await getAllTags();

  return (
    <ArchiveList<Tag>
      title="태그"
      items={tags}
      getItemHref={(t) => `/posts/?tag=${t.id}`}
      getItemLabel={(t) => t.name}
      emptyMessage="아직 등록된 태그가 없습니다."
    />
  );
}
