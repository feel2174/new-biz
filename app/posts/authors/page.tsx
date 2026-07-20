import { getAllAuthors } from "@/lib/wordpress";
import { ArchiveList } from "@/components/archive-list";
import type { Author } from "@/lib/wordpress.d";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "작성자",
  description: "작성자별로 글을 모아보세요.",
  alternates: {
    canonical: "/posts/authors",
  },
};

export default async function Page() {
  const authors = await getAllAuthors();

  return (
    <ArchiveList<Author>
      title="작성자"
      items={authors}
      getItemHref={(a) => `/posts/?author=${a.id}`}
      getItemLabel={(a) => a.name}
      emptyMessage="아직 등록된 작성자가 없습니다."
    />
  );
}
