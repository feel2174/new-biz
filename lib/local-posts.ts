// biz.zucca100.com 자체 블로그 글(코드 내장 콘텐츠).
// zucca100.com 원문을 같은 주제로 새로 쓴(리라이팅) 한국어 글을 content/posts.json에 보관한다.
// (헤드리스 WP와 별개의 로컬 콘텐츠 소스 — git 배포)

import postsData from "@/content/posts.json";

export type LocalCta = {
  label: string;
  href: string;
};

export type ActionGuideLink = {
  label: string;
  href: string;
  description?: string;
};

export type ActionGuideTask = {
  id: string;
  title: string;
  description: string;
  steps?: string[];
  href?: string;
  hrefLabel?: string;
  hrefDescription?: string;
  keywords?: string[];
};

export type ActionGuideFaq = {
  question: string;
  answer: string;
};

export type ActionGuide = {
  primaryKeyword: string;
  intent: string;
  summary: string[];
  quickLinks?: ActionGuideLink[];
  tasks: ActionGuideTask[];
  checks?: string[];
  cautions?: string[];
  faq?: ActionGuideFaq[];
  relatedKeywords?: string[];
  disclaimer?: string;
};

export type LocalPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO 문자열
  category?: string;
  coverImage?: string;
  cta?: LocalCta[];
  actionGuide?: ActionGuide;
  contentHtml?: string;
};

// 최신순 정렬된 불변 배열
const posts: LocalPost[] = (postsData as LocalPost[])
  .slice()
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getLocalPosts(): LocalPost[] {
  return posts;
}

export function getLocalPostBySlug(slug: string): LocalPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getLocalSlugs(): string[] {
  return posts.map((post) => post.slug);
}
