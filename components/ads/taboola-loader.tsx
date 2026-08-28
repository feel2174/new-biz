"use client";

import Script from "next/script";
import { useTrafficGate } from "@/components/traffic/traffic-gate";
import { useAdGate } from "@/components/ads/ad-gate";

const TABOOLA_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_TABOOLA_PUBLISHER_ID || "zucca-network";

/**
 * Taboola 로더 스크립트. AdSenseScript와 동일하게 유료 광고 유입(isPaid)에서 주입하며,
 * 게이팅을 해제한 페이지(forceAds, post.ungateAds)에서는 다이렉트 접속에도 주입한다.
 * 그 외 다이렉트 접속·크롤러에는 _taboola 전역도, 로더 스크립트도, 픽셀 요청도 발생하지 않음.
 */
export function TaboolaLoader() {
  const { isPaid } = useTrafficGate();
  const { forceAds } = useAdGate();

  if (!isPaid && !forceAds) return null;

  return (
    <Script
      id="taboola-loader"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function () {
    var PUBLISHER_ID = '${TABOOLA_PUBLISHER_ID}';
    var PAGE_TYPE    = 'article';

    var LOADER_URL         = '//cdn.taboola.com/libtrc/'       + PUBLISHER_ID + '/loader.js';
    var LOADER_PRIVACY_URL = '//static.tblcontent.com/libtrc/' + PUBLISHER_ID + '/loader.privacy.js';
    var PIXEL_URL          = 'https://static.qovani.com/libtrc/tr5?type=pixel&publisher=' + PUBLISHER_ID;
    var SCRIPT_ID          = 'tb_loader_script';

    window._taboola = window._taboola || [];

    var pageTypePush = {};
    pageTypePush[PAGE_TYPE] = 'auto';
    _taboola.push(pageTypePush);

    new Image().src = PIXEL_URL;

    var firstScript = document.getElementsByTagName('script')[0];

    function injectLoader(id, src, fallbackSrc) {
        if (document.getElementById(id)) return;
        var s = document.createElement('script');
        s.async = true;
        s.src   = src;
        s.id    = id;
        if (fallbackSrc) {
            s.onerror = function () {
                if (s.parentNode) s.parentNode.removeChild(s);
                injectLoader(SCRIPT_ID + '_fb', fallbackSrc, null);
            };
        }
        firstScript.parentNode.insertBefore(s, firstScript);
    }

    injectLoader(SCRIPT_ID, LOADER_URL, LOADER_PRIVACY_URL);

    if (window.performance && typeof window.performance.mark === 'function') {
        window.performance.mark('tbl_ic');
    }
})();
`,
      }}
    />
  );
}
