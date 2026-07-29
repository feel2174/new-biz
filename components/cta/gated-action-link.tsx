"use client";

import { usePathname } from "next/navigation";
import { PaidOnly, useTrafficGate } from "@/components/traffic/traffic-gate";
import { buildOutboundHref } from "@/lib/utm";
import { cn } from "@/lib/utils";

export function GatedActionLink({
  href,
  label,
  description,
  buttonName,
  className,
}: {
  href: string;
  label: string;
  description?: string;
  buttonName: string;
  className?: string;
}) {
  const { naverAdParams } = useTrafficGate();
  const pathname = usePathname();

  const outboundHref = buildOutboundHref(href, {
    utmSource: typeof window !== "undefined" ? window.location.hostname : undefined,
    utmMedium: "referral",
    utmCampaign: pathname || undefined,
    utmContent: buttonName,
    utmTerm: naverAdParams?.n_keyword || naverAdParams?.n_query,
    naverAdParams,
  });

  return (
    <PaidOnly>
      <a
        href={outboundHref}
        rel="noopener noreferrer sponsored"
        className={cn(
          "block rounded-xl px-6 py-5 text-center text-lg font-bold leading-snug no-underline",
          className
        )}
        style={{
          backgroundColor: "#FEE500",
          color: "#191600",
          animation: "pulse-cta 2s infinite",
        }}
        onClick={() => {
          // @ts-expect-error - gtag는 app/layout.tsx head 스크립트가 주입하는 전역
          window.gtag?.("event", "cta_click", {
            transport_type: "beacon",
            button_name: buttonName,
            link_url: outboundHref,
            source_domain: window.location.hostname,
            nv_query: sessionStorage.getItem("nv_query") || "(none)",
            nv_keyword: sessionStorage.getItem("nv_keyword") || "(none)",
            nv_rank: sessionStorage.getItem("nv_rank") || "",
            nv_match: sessionStorage.getItem("nv_match") || "(organic)",
          });
        }}
      >
        <span className="block">{label}</span>
        {description && (
          <span
            className="mt-1 block text-sm font-medium"
            style={{ color: "#3d2b00" }}
          >
            {description}
          </span>
        )}
      </a>
    </PaidOnly>
  );
}
