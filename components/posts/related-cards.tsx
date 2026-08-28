import Link from "next/link";
import { getLocalPostBySlug } from "@/lib/local-posts";

/**
 * 하단 "함께 보면 좋은 글" 내부 관련 카드.
 * Taboola(외부 추천)와 별개로, 같은 클러스터의 로컬 글로 보내 세션을 사이트 안에
 * 유지시킨다 = 추가 페이지뷰·광고 노출(간접 RPM). 내부 이동이므로 게이팅하지 않는다.
 * 내부 링크의 쿼리스트링(네이버 광고 파라미터 등) 이어붙이기는 PreserveLinkParams가
 * a[href^="/posts/"]를 대상으로 처리하므로, 여기 링크도 동일하게 커버된다.
 */
export function RelatedCards({ slugs }: { slugs: string[] }) {
  const items = slugs
    .map((slug) => getLocalPostBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (items.length === 0) return null;

  return (
    <section className="mt-10 not-prose" aria-label="함께 보면 좋은 글">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-neutral-900">
        함께 보면 좋은 글
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/posts/${p.slug}`}
            className="group block rounded-2xl border border-neutral-200 bg-white p-4 no-underline transition-colors hover:border-neutral-300 hover:bg-neutral-50"
          >
            {p.category && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  color: "hsl(var(--editorial-accent-strong))",
                  backgroundColor: "hsl(var(--editorial-accent-soft))",
                }}
              >
                {p.category}
              </span>
            )}
            <div className="mt-1.5 font-bold leading-snug text-neutral-900 group-hover:text-neutral-700">
              {p.title}
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500">
              {p.excerpt}
            </p>
            <span
              className="mt-2 inline-block text-sm font-semibold"
              style={{ color: "hsl(var(--editorial-accent-strong))" }}
            >
              자세히 보기 →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
