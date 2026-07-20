import { getAllCategories } from "@/lib/wordpress";
import { ArchiveList } from "@/components/archive-list";
import type { Category } from "@/lib/wordpress.d";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "카테고리",
  description: "주제별 카테고리로 정보를 모아보세요.",
  alternates: {
    canonical: "/posts/categories",
  },
};

export default async function Page() {
  const categories = await getAllCategories();

  return (
    <ArchiveList<Category>
      title="카테고리"
      items={categories}
      getItemHref={(c) => `/posts/?category=${c.id}`}
      getItemLabel={(c) => c.name}
      emptyMessage="아직 등록된 카테고리가 없습니다."
    />
  );
}
