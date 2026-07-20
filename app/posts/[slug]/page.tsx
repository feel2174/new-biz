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
import { CtaLink } from "@/components/cta/cta-link";
import { ActionGuideLanding } from "@/components/landing/action-guide";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
        <Article dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
        {adSlotArticle && <AdSenseUnit slot={adSlotArticle} />}
      </Container>
    </Section>
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
  // 본문에 <!--CTA:n--> 마커가 있으면 해당 위치에 n번째 CTA를 인라인으로 렌더(상단 블록 대신)
  const hasInlineCta = !!(
    post.cta &&
    post.cta.length > 0 &&
    post.contentHtml &&
    /<!--CTA:\d+-->/.test(post.contentHtml)
  );

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

        <Prose>
          <h1>{post.title}</h1>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm mb-4">
            <h5 className="text-muted-foreground">{date} 게시</h5>
            {post.category && (
              <span className={cn(badgeVariants({ variant: "outline" }), "w-fit")}>
                {post.category}
              </span>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        </Prose>

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

        {adSlotArticle && <AdSenseUnit slot={adSlotArticle} />}
        {post.actionGuide ? (
          <ActionGuideLanding
            guide={post.actionGuide}
            cta={post.cta}
            slug={post.slug}
          />
        ) : hasInlineCta && post.contentHtml ? (
          post.contentHtml.split(/<!--CTA:(\d+)-->/).map((part, idx) => {
            // split(캡처그룹): 짝수 idx=HTML 조각, 홀수 idx=CTA 인덱스
            if (idx % 2 === 1) {
              const btn = post.cta?.[Number(part)];
              return btn ? (
                <CtaLink
                  key={`cta-${idx}`}
                  btn={btn}
                  buttonName={`${post.slug}-cta${part}`}
                />
              ) : null;
            }
            return part ? (
              <Article
                key={`seg-${idx}`}
                dangerouslySetInnerHTML={{ __html: part }}
              />
            ) : null;
          })
        ) : (
          <Article dangerouslySetInnerHTML={{ __html: post.contentHtml ?? "" }} />
        )}
        {adSlotArticle && <AdSenseUnit slot={adSlotArticle} />}
      </Container>
    </Section>
  );
}
