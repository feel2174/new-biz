"use client";

import { usePathname } from "next/navigation";
import { PaidOnly, useTrafficGate } from "@/components/traffic/traffic-gate";
import { buildOutboundHref } from "@/lib/utm";

/**
 * 유료 유입에서만 노출되는 CTA 버튼.
 * 클릭 시 GA4로 cta_click 이벤트(button_name·link_url)를 전송한다.
 * biz.zucca100.com -> zucca100.com처럼 같은 도메인이 아닌 이동은 GA4 향상된 측정의
 * 이탈 클릭(outbound click)으로 자동 수집되지만, 페이지·버튼 단위로 구분하기 위해
 * 별도의 커스텀 이벤트도 함께 남긴다.
 * 네이버 광고로 유입된 세션이면(랜딩 시 감지된 n_query·n_keyword 등) 같은 이벤트에
 * 함께 실어 보내, "어떤 키워드가 어떤 버튼 클릭으로 이어지는지" 한 이벤트로 바로 볼 수 있다.
 *
 * 이동 URL 자체에도 utm_source(현재 호스트명)·utm_medium=referral·utm_campaign(경로)·
 * utm_content(버튼명)와, 랜딩 시 잡힌 네이버 n_* 파라미터를 그대로 실어 보낸다. 목적지
 * GA에서 "new-biz를 거쳐 온 유입"과 그 외 유입을 구분하고, 네이버 키워드 단위로도
 * 이어볼 수 있게 하기 위함이다.
 */
export function CtaLink({
  btn,
  buttonName,
  forceShow = false,
}: {
  btn: { label: string; href: string };
  buttonName: string;
  /** true면 게이팅(PaidOnly)을 우회해 다이렉트 접속에도 노출한다(post.ungateCta). */
  forceShow?: boolean;
}) {
  const { naverAdParams } = useTrafficGate();
  const pathname = usePathname();

  const outboundHref = buildOutboundHref(btn.href, {
    utmSource: typeof window !== "undefined" ? window.location.hostname : undefined,
    utmMedium: "referral",
    utmCampaign: pathname || undefined,
    utmContent: buttonName,
    utmTerm: naverAdParams?.n_keyword || naverAdParams?.n_query,
    naverAdParams,
  });

  const button = (
    <div className="my-8 flex flex-col gap-4 not-prose">
      <a
        href={outboundHref}
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
            const nQuery = naverAdParams?.n_query || "";
            const nKeyword = naverAdParams?.n_keyword || "";
            // @ts-expect-error - gtag는 app/layout.tsx head 스크립트가 주입하는 전역
            window.gtag?.("event", "cta_click", {
              transport_type: "beacon",
              button_name: buttonName,
              link_url: outboundHref,
              source_domain: window.location.hostname,
              nv_query: nQuery || "(none)",
              nv_keyword: nKeyword || "(none)",
              nv_rank: naverAdParams?.n_rank || "",
              nv_match: nQuery && nKeyword ? (nQuery === nKeyword ? "exact" : "broad") : "(organic)",
            });
          }}
        >
          {btn.label}
        </a>
      </div>
  );

  // ungateCta 글은 게이팅 없이 항상 노출, 그 외에는 유료 유입에만 노출.
  return forceShow ? button : <PaidOnly>{button}</PaidOnly>;
}
