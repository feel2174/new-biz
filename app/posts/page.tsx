import { getRecentPosts } from "@/lib/wordpress";
import { getLocalPosts } from "@/lib/local-posts";
import { stripHtml, truncateHtml } from "@/lib/metadata";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Section, Container, Prose } from "@/components/craft";
import { PostListCard, type PostListItem } from "@/components/posts/post-list-card";
import { SearchInput } from "@/components/posts/search-input";
import { AdSenseUnit } from "@/components/ads/adsense-unit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "블로그",
  description: "생활·금융·정책·서비스 정보를 한곳에서 모아보세요.",
  alternates: {
    canonical: "/posts",
  },
};

export const revalidate = 3600;

const POSTS_PER_PAGE = 10;

// 로컬 글 + WP 글을 정규화·병합해 최신순으로 반환
async function getMergedPosts(): Promise<PostListItem[]> {
  const [wpPosts, localPosts] = await Promise.all([
    getRecentPosts(),
    Promise.resolve(getLocalPosts()),
  ]);

  const localItems: PostListItem[] = localPosts.map((post) => ({
    href: `/posts/${post.slug}`,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    image: post.coverImage,
  }));

  const localSlugs = new Set(localPosts.map((p) => p.slug));

  const wpItems: PostListItem[] = wpPosts
    .filter((post) => !localSlugs.has(post.slug)) // 로컬 우선, 중복 제거
    .map((post) => {
      const media = post._embedded?.["wp:featuredmedia"]?.[0] ?? null;
      const category = post._embedded?.["wp:term"]?.[0]?.[0] ?? null;
      return {
        href: `/posts/${post.slug}`,
        title: post.title?.rendered ?? "제목 없음",
        excerpt: post.excerpt?.rendered
          ? truncateHtml(post.excerpt.rendered, 20)
          : "",
        date: post.date,
        category: category?.name,
        image: media?.source_url,
      };
    });

  return [...localItems, ...wpItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}) {
  const { page: pageParam, search, category } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;

  let posts = await getMergedPosts();

  // 카테고리 필터
  if (category) {
    posts = posts.filter((p) => p.category === category);
  }

  // 제목 기준 간단 검색
  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter((p) => stripHtml(p.title).toLowerCase().includes(q));
  }

  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", newPage.toString());
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    return `/posts${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const adSlotList = process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIST;

  return (
    <Section>
      <Container>
        <div className="space-y-8">
          <Prose>
            <h1>{category ? category : "전체 글"}</h1>
            <p className="text-muted-foreground">
              총 {total.toLocaleString("ko-KR")}개의 글
              {search && " · 검색 결과"}
            </p>
          </Prose>

          <SearchInput defaultValue={search} />

          {adSlotList && <AdSenseUnit slot={adSlotList} />}

          {pagePosts.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pagePosts.map((post) => (
                <PostListCard key={post.href} post={post} />
              ))}
            </div>
          ) : (
            <div className="h-24 w-full border rounded-lg bg-accent/25 flex items-center justify-center">
              <p className="text-muted-foreground">표시할 글이 없습니다.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center py-8">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={createPaginationUrl(currentPage - 1)}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (pageNum) =>
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1
                    )
                    .map((pageNum, index, array) => {
                      const showEllipsis =
                        index > 0 && pageNum - array[index - 1] > 1;
                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsis && <span className="px-2">...</span>}
                          <PaginationItem>
                            <PaginationLink
                              href={createPaginationUrl(pageNum)}
                              isActive={pageNum === currentPage}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        </div>
                      );
                    })}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext href={createPaginationUrl(currentPage + 1)} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
