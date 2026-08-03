import "./globals.css";

import { Noto_Sans_KR as FontSans } from "next/font/google";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SiteJsonLd } from "@/components/seo/json-ld";
import { TrafficGateProvider } from "@/components/traffic/traffic-gate";
import { AdSenseScript } from "@/components/ads/adsense-script";
import { TaboolaLoader } from "@/components/ads/taboola-loader";
import { TaboolaFlush } from "@/components/ads/taboola-flush";
import { LinkClickTracker } from "@/components/analytics/link-click-tracker";
import { Analytics } from "@vercel/analytics/next";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";

import type { Metadata, Viewport } from "next";

const font = FontSans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  preload: false,
});

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-NKFTVWQZVH";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.site_name} | 생활·금융·정책 정보 블로그`,
    template: `%s | ${siteConfig.site_name}`,
  },
  description: siteConfig.site_description,
  metadataBase: new URL(siteConfig.site_domain),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.site_domain,
    siteName: siteConfig.site_name,
    title: siteConfig.site_name,
    description: siteConfig.site_description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.site_name,
    description: siteConfig.site_description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

var p = new URLSearchParams(location.search);
// components/traffic/traffic-gate.tsx의 NAVER_PAID_KEYS와 반드시 동일하게 유지할 것 —
// 두 목록이 어긋나면 CTA는 노출되는데 GA4에는 naver/cpc로 잡히지 않는 유입이 생긴다.
var naverKeys = ['NaPm', 'n_media', 'n_query', 'n_rank', 'n_ad_group', 'n_ad', 'n_keyword', 'n_keyword_id', 'n_campaign_type', 'n_contract'];
var isNaverAd = naverKeys.some(function (k) { return p.has(k); });

var config = { cookie_domain: 'zucca100.com' };

if (isNaverAd) {
  // NaPm은 네이버가 서버 측에서만 해석 가능한 인코딩 값이라 클라이언트에서 키워드로
  // 풀어낼 수 없다 — 그 경우 source/medium만 채우고 term/content/id는 비워둔다.
  var nQuery = p.get('n_query') || '';
  var nKeyword = p.get('n_keyword') || '';

  config.campaign_source = 'naver';
  config.campaign_medium = 'cpc';
  config.campaign_term = nKeyword || nQuery;
  config.campaign_content = p.get('n_ad') || '';
  config.campaign_id = p.get('n_ad_group') || '';
}

gtag('config', '${GA_MEASUREMENT_ID}', config);`,
          }}
        />
      </head>
      <body className={cn("min-h-screen font-sans antialiased", font.variable)}>
        <TrafficGateProvider>
          <AdSenseScript />
          <TaboolaLoader />
          <LinkClickTracker />
          <SiteJsonLd />
          <Nav />
          {children}
          <Footer />
          <TaboolaFlush />
        </TrafficGateProvider>
        <Analytics />
      </body>
    </html>
  );
}
