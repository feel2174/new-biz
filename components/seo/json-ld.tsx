import { siteConfig } from "@/site.config";

/**
 * 구조화 데이터(JSON-LD)를 안전하게 렌더링하는 헬퍼.
 * 검색엔진 SEO(리치 결과)를 위해 사용.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify 결과만 주입하므로 안전
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** 사이트 전역 WebSite + Organization 스키마 */
export function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.site_domain}/#website`,
        url: siteConfig.site_domain,
        name: siteConfig.site_name,
        description: siteConfig.site_description,
        inLanguage: "ko-KR",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteConfig.site_domain}/posts?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteConfig.site_domain}/#organization`,
        name: siteConfig.site_name,
        url: siteConfig.site_domain,
        description: siteConfig.site_description,
      },
    ],
  };

  return <JsonLd data={data} />;
}
