"use client";

import Script from "next/script";
import { useTrafficGate } from "@/components/traffic/traffic-gate";
import { useAdGate } from "@/components/ads/ad-gate";

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9196149361612087";

/**
 * AdSense 로더 스크립트(adsbygoogle.js).
 * 유료 광고 유입(isPaid)에서 주입하며, 게이팅을 해제한 페이지(forceAds, post.ungateAds)
 * 에서는 다이렉트 접속에도 주입한다. 그 외 다이렉트 접속·크롤러에는 로드하지 않음.
 */
export function AdSenseScript() {
  const { isPaid } = useTrafficGate();
  const { forceAds } = useAdGate();

  if (!isPaid && !forceAds) return null;

  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
