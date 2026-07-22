"use client";

import { PaidOnly, useTrafficGate } from "@/components/traffic/traffic-gate";

/**
 * 유료 유입에서만 노출되는 CTA 버튼.
 * 클릭 시 GA4로 cta_click 이벤트(button_name·link_url)를 전송한다.
 * biz.zucca100.com -> zucca100.com처럼 같은 도메인이 아닌 이동은 GA4 향상된 측정의
 * 이탈 클릭(outbound click)으로 자동 수집되지만, 페이지·버튼 단위로 구분하기 위해
 * 별도의 커스텀 이벤트도 함께 남긴다.
 * 네이버 광고로 유입된 세션이면(랜딩 시 감지된 n_query·n_keyword 등) 같은 이벤트에
 * 함께 실어 보내, "어떤 키워드가 어떤 버튼 클릭으로 이어지는지" 한 이벤트로 바로 볼 수 있다.
 */
export function CtaLink({
  btn,
  buttonName,
}: {
  btn: { label: string; href: string };
  buttonName: string;
}) {
  const { naverAdParams } = useTrafficGate();

  return (
    <PaidOnly>
      <div className="my-8 flex flex-col gap-4 not-prose">
        <a
          href={btn.href}
          rel="noopener noreferrer sponsored"
          className="block text-center leading-snug no-underline"
          style={{
            borderRadius: "8px",
            padding: "14px 20px",
            backgroundColor: "#FEE500",
            color: "#191600",
            fontSize: "1.05rem",
            fontWeight: 700,
            animation: "pulse-cta 2s infinite",
          }}
          onClick={() => {
            // @ts-expect-error - gtag는 app/layout.tsx head 스크립트가 주입하는 전역
            window.gtag?.("event", "cta_click", {
              button_name: buttonName,
              link_url: btn.href,
              ...naverAdParams,
            });
          }}
        >
          {btn.label}
        </a>
      </div>
    </PaidOnly>
  );
}
