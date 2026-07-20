"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTrafficGate } from "@/components/traffic/traffic-gate";

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9196149361612087";

interface AdSenseUnitProps {
  /** AdSense 대시보드에서 발급한 광고 유닛 슬롯 ID */
  slot?: string;
  /** 반응형 광고(기본 auto) */
  format?: string;
  /** 광고 영역을 컨테이너 너비에 맞춤 */
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Google AdSense 광고 유닛.
 * 슬롯 ID(env: NEXT_PUBLIC_ADSENSE_SLOT_*)가 없으면 렌더하지 않는다.
 * 로더 스크립트는 app/layout.tsx <head>에서 1회 로드된다.
 */
export function AdSenseUnit({
  slot,
  format = "auto",
  responsive = true,
  className,
  style,
}: AdSenseUnitProps) {
  const { isPaid } = useTrafficGate();
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !slot || !isPaid) return;
    try {
      // @ts-expect-error - adsbygoogle는 외부 스크립트가 주입하는 전역
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // 광고 차단기 등으로 실패해도 무시
    }
  }, [slot, isPaid]);

  // 슬롯 미설정 또는 비(非)유료 유입(다이렉트·크롤러)에는 광고 미노출
  if (!slot || !isPaid) return null;

  return (
    <div className={cn("my-6 flex w-full justify-center overflow-hidden", className)}>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
