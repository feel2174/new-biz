"use client";

import Script from "next/script";
import { useTrafficGate } from "@/components/traffic/traffic-gate";

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9196149361612087";

/**
 * AdSense 로더 스크립트(adsbygoogle.js).
 * 유료 광고 유입(isPaid)에서만 주입한다. 다이렉트 접속·크롤러에는 스크립트 자체를 로드하지 않음.
 */
export function AdSenseScript() {
  const { isPaid } = useTrafficGate();

  if (!isPaid) return null;

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
