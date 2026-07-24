"use client";

import { useEffect } from "react";
import { useTrafficGate } from "@/components/traffic/traffic-gate";

/**
 * 사이트 전체(내비게이션·본문·푸터 등)의 <a> 클릭을 문서 레벨에서 위임 감지해,
 * 같은 도메인으로 가는 링크는 internal_link_click, 다른 도메인으로 가는 링크는
 * external_link_click 이벤트로 GA4에 각각 전송한다.
 *
 * CtaLink의 cta_click(버튼 단위 전환 추적)과는 별개로, "내부 이동 vs 외부 이탈"을
 * 사이트 전체 기준으로 구분해서 보기 위한 용도라 CTA 버튼 클릭 시에는 두 이벤트가
 * 함께 발생할 수 있다(의도된 동작).
 */
export function LinkClickTracker() {
  const { naverAdParams } = useTrafficGate();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      const isInternal = url.hostname === window.location.hostname;

      // @ts-expect-error - gtag는 app/layout.tsx head 스크립트가 주입하는 전역
      window.gtag?.("event", isInternal ? "internal_link_click" : "external_link_click", {
        link_url: url.href,
        link_text: anchor.textContent?.trim().slice(0, 100) || "",
        page_path: window.location.pathname,
        ...(isInternal ? {} : naverAdParams || {}),
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [naverAdParams]);

  return null;
}
