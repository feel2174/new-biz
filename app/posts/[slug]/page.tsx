import { getPostBySlug, getAllPostSlugs } from "@/lib/wordpress";
import {
  getLocalPostBySlug,
  getLocalSlugs,
  type LocalPost,
} from "@/lib/local-posts";
import { generateContentMetadata, stripHtml } from "@/lib/metadata";
import { siteConfig } from "@/site.config";

import { Section, Container, Article, Prose } from "@/components/craft";
import { badgeVariants } from "@/components/ui/badge";
import { AdSenseUnit } from "@/components/ads/adsense-unit";
import { TaboolaUnit } from "@/components/ads/taboola-unit";
import { CtaLink } from "@/components/cta/cta-link";
import { StickyCta } from "@/components/cta/sticky-cta";
import { PreserveLinkParams } from "@/components/posts/preserve-link-params";
import { ActionGuideLanding } from "@/components/landing/action-guide";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// 본문 HTML에서 지정된 번째수(들)의 <p> 태그 뒤에 마커를 삽입한다. 문단이 부족한 위치는 건너뛴다.
function insertAfterParagraphs(html: string, marker: string, ns: number[]): string {
  const targets = new Set(ns);
  const closingTagRe = /<\/p>/gi;
  let count = 0;
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = closingTagRe.exec(html))) {
    count++;
    if (targets.has(count)) {
      const idx = match.index + match[0].length;
      result += html.slice(lastIndex, idx) + marker;
      lastIndex = idx;
    }
  }
  result += html.slice(lastIndex);
  return result;
}

const MIDARTICLE_AD_MARKER = "<!--MIDARTICLE_AD-->";
const CONTENT_MARKER_RE = /<!--(?:CTA:(\d+)|MIDARTICLE_AD)-->/;

// 에디토리얼(.editorial) 본문에서 콜아웃·FAQ 카드로 승격할 문단에 클래스를 부여한다.
// CSS :has(strong:only-child)는 텍스트 노드를 무시해 "본문 중간에 굵은 단어 하나"인
// 일반 문단까지 잡으므로, 문자열 패턴으로 정확히 구분한다.
//  - ed-callout: 문단 전체가 <strong>…</strong> 하나뿐(앞뒤 텍스트 없음) — CTA 앞 후킹 문장
//  - ed-faq:     <p><strong>질문</strong> 답변…</p> — strong으로 시작하고 뒤에 텍스트가 붙음
function styleEditorialPatterns(html: string): string {
  return html
    .replace(
      /<p><strong>([^<]*?)<\/strong><\/p>/g,
      '<p class="ed-callout"><strong>$1</strong></p>'
    )
    .replace(
      /<p><strong>([^<]*?)<\/strong>(\s*[^<\s][^]*?)<\/p>/g,
      '<p class="ed-faq"><strong>$1</strong>$2</p>'
    );
}

// contentHtml을 <!--CTA:n--> / 광고 마커 기준으로 쪼개, 본문·CTA 버튼·중간 디스플레이 광고를 순서대로 렌더한다.
function renderPostContent(
  html: string,
  post: LocalPost,
  adSlotMidArticle?: string,
  forceShowAds = false
) {
  return html.split(CONTENT_MARKER_RE).map((part, idx) => {
    // split(캡처그룹): 짝수 idx=HTML 조각, 홀수 idx=CTA 인덱스 문자열 또는 광고 마커(undefined)
    if (idx % 2 === 0) {
      return part ? (
        <Article
          key={`seg-${idx}`}
          dangerouslySetInnerHTML={{ __html: styleEditorialPatterns(part) }}
        />
      ) : null;
    }
    if (part === undefined) {
      return adSlotMidArticle ? (
        <AdSenseUnit key={`midad-${idx}`} slot={adSlotMidArticle} forceShow={forceShowAds} />
      ) : null;
    }
    const btn = post.cta?.[Number(part)];
    return btn ? (
      <CtaLink key={`cta-${idx}`} btn={btn} buttonName={`${post.slug}-cta${part}`} />
    ) : null;
  });
}

export async function generateStaticParams() {
  const [wpSlugs, localSlugs] = await Promise.all([
    getAllPostSlugs(),
    Promise.resolve(getLocalSlugs()),
  ]);
  const seen = new Set(localSlugs);
  return [
    ...localSlugs.map((slug) => ({ slug })),
    ...wpSlugs.filter((p) => !seen.has(p.slug)),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const local = getLocalPostBySlug(slug);
  if (local) {
    return generateContentMetadata({
      title: local.title,
      description: local.excerpt,
      slug: local.slug,
      basePath: "posts",
    });
  }

  const post = await getPostBySlug(slug);
  if (!post) return {};

  return generateContentMetadata({
    title: stripHtml(post.title.rendered),
    description: stripHtml(post.excerpt.rendered),
    slug: post.slug,
    basePath: "posts",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const local = getLocalPostBySlug(slug);
  if (local) {
    return <LocalPostView post={local} />;
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const author = post._embedded?.author?.[0];
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const category = post._embedded?.["wp:term"]?.[0]?.[0];
  const date = new Date(post.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const postUrl = `${siteConfig.site_domain}/posts/${post.slug}`;
  const adSlotArticle = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: stripHtml(post.title.rendered),
    description: stripHtml(post.excerpt.rendered),
    datePublished: post.date,
    dateModified: post.modified,
    inLanguage: "ko-KR",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    url: postUrl,
    ...(featuredMedia?.source_url ? { image: [featuredMedia.source_url] } : {}),
    ...(author?.name
      ? { author: { "@type": "Person", name: author.name } }
      : {}),
    publisher: { "@type": "Organization", name: siteConfig.site_name },
  };

  return (
    <Section>
      <Container className="max-w-2xl">
        <JsonLd data={articleJsonLd} />
        <Prose>
          <h1>
            <span
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            ></span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm mb-4">
            <h5 className="text-muted-foreground">
              {date} 게시
              {author?.name && (
                <>
                  {" "}·{" "}
                  <a href={`/posts/?author=${author.id}`}>{author.name}</a>
                </>
              )}
            </h5>
            {category && (
              <Link
                href={`/posts/?category=${category.id}`}
                className={cn(
                  badgeVariants({ variant: "outline" }),
                  "no-underline! w-fit"
                )}
              >
                {category.name}
              </Link>
            )}
          </div>
          {featuredMedia?.source_url && (
            <div className="h-64 sm:h-96 my-8 md:h-[500px] overflow-hidden flex items-center justify-center border rounded-lg bg-accent/25">
              {/* eslint-disable-next-line */}
              <img
                className="w-full h-full object-cover"
                src={featuredMedia.source_url}
                alt={stripHtml(post.title.rendered)}
              />
            </div>
          )}
        </Prose>

        {adSlotArticle && <AdSenseUnit slot={adSlotArticle} />}
        <PreserveLinkParams>
          <Article dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
        </PreserveLinkParams>
        {adSlotArticle && <AdSenseUnit slot={adSlotArticle} />}
        <TaboolaPlacements />
      </Container>
    </Section>
  );
}

// Taboola 배치 2종(Right Rail·Below Article). 이 사이트는 사이드바가 없는
// 1단 레이아웃이라 두 위젯을 본문과 분리된 컨테이너에 순서대로 쌓아서 배치한다.
// 유료 광고 유입에서만 렌더되며(TaboolaUnit 내부 게이팅), flush는 layout.tsx에서
// Footer 뒤에 한 번만 호출된다.
function TaboolaPlacements() {
  return (
    <div className="mt-8 space-y-8 not-prose">
      <TaboolaUnit
        containerId="taboola-right-rail-thumbnails"
        mode="thumbnails-rr"
        placement="Right Rail Thumbnails"
      />
      <TaboolaUnit
        containerId="taboola-below-article-thumbnails"
        mode="alternating-thumbnails-a"
        placement="Below Article Thumbnails"
      />
    </div>
  );
}

// 로컬(코드 내장) 글 렌더링 — CTA·광고는 유료 유입에만 노출
function LocalPostView({ post }: { post: LocalPost }) {
  const date = new Date(post.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const postUrl = `${siteConfig.site_domain}/posts/${post.slug}`;
  const adSlotArticle = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE;
  // 네광용 디스플레이 광고 슬롯 — 2번째, 4번째 문단 뒤에 각각 삽입
  const adSlotMidArticle =
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDARTICLE || "8085639039";
  // 이 글은 게이팅을 해제해 모든 유입(다이렉트 포함)에 AdSense 광고를 바로 노출
  const forceShowAds = post.ungateAds === true;
  // 본문에 <!--CTA:n--> 마커가 있으면 해당 위치에 n번째 CTA를 인라인으로 렌더(상단 블록 대신)
  const hasInlineCta = !!(
    post.cta &&
    post.cta.length > 0 &&
    post.contentHtml &&
    /<!--CTA:\d+-->/.test(post.contentHtml)
  );
  const contentWithAdMarker = post.contentHtml
    ? insertAfterParagraphs(post.contentHtml, MIDARTICLE_AD_MARKER, [2, 4])
    : post.contentHtml;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    inLanguage: "ko-KR",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    url: postUrl,
    ...(post.coverImage ? { image: [post.coverImage] } : {}),
    publisher: { "@type": "Organization", name: siteConfig.site_name },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteConfig.site_domain },
      {
        "@type": "ListItem",
        position: 2,
        name: "블로그",
        item: `${siteConfig.site_domain}/posts`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <Section>
      <Container className="max-w-2xl">
        <JsonLd data={articleJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />

        {post.coverImage && (
          <div className="mb-6 overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <header className="editorial-hero">
          {post.category && (
            <span
              className="inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-semibold"
              style={{
                color: "hsl(var(--editorial-accent-strong))",
                backgroundColor: "hsl(var(--editorial-accent-soft))",
                borderColor: "hsl(var(--editorial-accent-border))",
              }}
            >
              {post.category}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-500">
            {post.excerpt}
          </p>
          <div className="mt-4 text-sm text-neutral-400">{date} 게시</div>
        </header>

        {post.cta && post.cta.length > 0 && !hasInlineCta && !post.actionGuide && (
          <>
            {post.cta.map((btn, i) => (
              <CtaLink
                key={`${i}-${btn.href}`}
                btn={btn}
                buttonName={`${post.slug}-cta${i}`}
              />
            ))}
          </>
        )}

        {adSlotArticle && <AdSenseUnit slot={adSlotArticle} forceShow={forceShowAds} />}
        {post.actionGuide ? (
          <ActionGuideLanding
            guide={post.actionGuide}
            cta={post.cta}
            slug={post.slug}
          />
        ) : (
          <PreserveLinkParams
            id={`local-post-body-${post.slug}`}
            className={cn(post.contentHtml && "editorial")}
          >
            {renderPostContent(contentWithAdMarker ?? "", post, adSlotMidArticle, forceShowAds)}
          </PreserveLinkParams>
        )}
        {adSlotArticle && <AdSenseUnit slot={adSlotArticle} forceShow={forceShowAds} />}
        <TaboolaPlacements />
      </Container>
      {post.cta && post.cta[0] && !post.actionGuide && (
        <StickyCta btn={post.cta[0]} buttonName={`${post.slug}-sticky-cta`} />
      )}
    </Section>
  );
}
