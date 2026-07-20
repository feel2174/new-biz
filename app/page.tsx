import { Section, Container, Prose } from "@/components/craft";
import { PostListCard, type PostListItem } from "@/components/posts/post-list-card";
import { AdSenseUnit } from "@/components/ads/adsense-unit";
import { Button } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import { PaidOnly } from "@/components/traffic/traffic-gate";

import { getRecentPosts } from "@/lib/wordpress";
import { getLocalPosts } from "@/lib/local-posts";
import { truncateHtml } from "@/lib/metadata";
import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const revalidate = 3600;

export default async function Home() {
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
    .filter((post) => !localSlugs.has(post.slug))
    .map((post) => {
      const media = post._embedded?.["wp:featuredmedia"]?.[0] ?? null;
      const category = post._embedded?.["wp:term"]?.[0]?.[0] ?? null;
      return {
        href: `/posts/${post.slug}`,
        title: post.title?.rendered ?? "제목 없음",
        excerpt: post.excerpt?.rendered ? truncateHtml(post.excerpt.rendered, 20) : "",
        date: post.date,
        category: category?.name,
        image: media?.source_url,
      };
    });

  const posts = [...localItems, ...wpItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // 카테고리 칩 (로컬 콘텐츠 기준 중복 제거)
  const categories = Array.from(
    new Set(localPosts.map((p) => p.category).filter(Boolean))
  ) as string[];

  const adSlotDisplay = process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY;

  return (
    <Section>
      <Container className="space-y-12">
        {/* 히어로 */}
        <div className="flex flex-col gap-6">
          <Prose>
            <h1 className="!mb-2">{siteConfig.site_name}</h1>
            <p className="text-lg text-muted-foreground">
              {siteConfig.site_description}
            </p>
          </Prose>
          <PaidOnly>
            <div className="flex flex-wrap gap-3 not-prose">
              <Button asChild>
                <Link href="/posts">
                  블로그 보기 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </PaidOnly>
        </div>

        {/* 카테고리 칩 */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-medium tracking-tight">카테고리</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/posts?category=${encodeURIComponent(category)}`}
                  className={cn(
                    badgeVariants({ variant: "secondary" }),
                    "no-underline"
                  )}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}

        {adSlotDisplay && <AdSenseUnit slot={adSlotDisplay} />}

        {/* 최신 글 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium tracking-tight">최신 글</h2>
            <Link
              href="/posts"
              className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
            >
              전체 보기
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostListCard key={post.href} post={post} />
              ))}
            </div>
          ) : (
            <div className="h-24 w-full border rounded-lg bg-accent/25 flex items-center justify-center">
              <p className="text-muted-foreground">
                아직 게시된 글이 없습니다. 곧 새로운 정보로 찾아뵙겠습니다.
              </p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
