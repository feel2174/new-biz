import { getAllPages } from "@/lib/wordpress";
import { ArchiveList } from "@/components/archive-list";
import type { Page as WPPage } from "@/lib/wordpress.d";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "페이지",
  description: "사이트의 안내 페이지를 모아보세요.",
  alternates: {
    canonical: "/pages",
  },
};

export default async function Page() {
  const pages = await getAllPages();

  return (
    <ArchiveList<WPPage>
      title="페이지"
      items={pages}
      getItemHref={(p) => `/pages/${p.slug}`}
      getItemLabel={(p) => p.title.rendered}
      emptyMessage="아직 등록된 페이지가 없습니다."
    />
  );
}
