type SiteConfig = {
  site_domain: string;
  site_name: string;
  site_description: string;
};

// site_domain: 이 신규 비즈채널의 실제 도메인.
// (metadataBase·canonical·sitemap·JSON-LD 가 이 값을 기준으로 생성됨)
export const siteConfig: SiteConfig = {
  site_name: "생활정보 나침반",
  site_description:
    "정부지원금·생활행정·금융 서비스 정보를 쉽고 정확하게 정리하는 정보 블로그입니다.",
  site_domain: "https://new-biz.zucca100.com",
};
