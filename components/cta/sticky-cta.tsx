"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PaidOnly, useTrafficGate } from "@/components/traffic/traffic-gate";
import { buildOutboundHref } from "@/lib/utm";

/**
 * 모바일 하단 고정 CTA. 본문 CTA(CtaLink)와 동일하게 유료 유입에서만 노출되며
 * (PaidOnly 게이팅) 스크롤을 어느 정도 내린 뒤 슬라이드로 등장한다. 이동 URL·클릭
 * 트래킹은 CtaLink와 완전히 동일한 규칙을 따른다 — buildOutboundHref로 UTM·네이버
 * n_* 파라미터를 실어 보내고, gtag cta_click 이벤트에 같은 필드를 남긴다. 데스크탑 숨김.
 */
export function StickyCta({
  btn,
  buttonName,
}: {
  btn: { label: string; href: string };
  buttonName: string;
}) {
  const { naverAdParams } = useTrafficGate();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  const outboundHref = buildOutboundHref(btn.href, {
    utmSource:
      typeof window !== "undefined" ? window.location.hostname : undefined,
    utmMedium: "referral",
    utmCampaign: pathname || undefined,
    utmContent: buttonName,
    utmTerm: naverAdParams?.n_keyword || naverAdParams?.n_query,
    naverAdParams,
  });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const nearBottom =
        window.innerHeight + y >= document.body.scrollHeight - 240;
      setShow(y > 600 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <PaidOnly>
      <div
        className="editorial-sticky-cta md:hidden"
        data-show={show ? "true" : "false"}
      >
        <a
          href={outboundHref}
          rel="noopener noreferrer sponsored"
          className="block rounded-xl px-5 py-3.5 text-center text-base font-bold no-underline"
          style={{ backgroundColor: "#FEE500", color: "#191600" }}
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
              nv_match:
                nQuery && nKeyword
                  ? nQuery === nKeyword
                    ? "exact"
                    : "broad"
                  : "(organic)",
            });
          }}
        >
          {btn.label}
        </a>
      </div>
    </PaidOnly>
  );
}
