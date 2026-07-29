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
var isNaverAd = p.has('n_ad') || p.has('n_keyword_id');

var config = { cookie_domain: 'zucca100.com' };

if (isNaverAd) {
  var nQuery = p.get('n_query') || '';
  var nKeyword = p.get('n_keyword') || '';

  config.campaign_source = 'naver';
  config.campaign_medium = 'cpc';
  config.campaign_term = nQuery;
  config.campaign_content = p.get('n_ad') || '';
  config.campaign_id = p.get('n_ad_group') || '';

  // 세션 저장 — CTA 클릭/도착 이벤트에 재사용
  sessionStorage.setItem('nv_query', nQuery);
  sessionStorage.setItem('nv_keyword', nKeyword);
  sessionStorage.setItem('nv_rank', p.get('n_rank') || '');
  sessionStorage.setItem('nv_match',
    nQuery && nKeyword ? (nQuery === nKeyword ? 'exact' : 'broad') : '');
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
