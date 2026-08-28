"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTrafficGate } from "@/components/traffic/traffic-gate";
import { useAdGate } from "@/components/ads/ad-gate";

interface TaboolaUnitProps {
  /** 페이지 내 유일해야 하는 위젯 컨테이너 id */
  containerId: string;
  /** Taboola 위젯 모드 (예: thumbnails-rr, alternating-thumbnails-a) */
  mode: string;
  /** Taboola 배치 이름 (예: Right Rail Thumbnails) */
  placement: string;
  targetType?: string;
  className?: string;
}

/**
 * Taboola 배치(위젯) 하나. AdSenseUnit과 동일하게 유료 광고 유입에서만 컨테이너를
 * 렌더하고 window._taboola에 설정을 1회만 push한다. 실제 렌더는 TaboolaFlush의
 * flush push가 일어난 뒤 로더 스크립트가 처리한다.
 */
export function TaboolaUnit({
  containerId,
  mode,
  placement,
  targetType = "mix",
  className,
}: TaboolaUnitProps) {
  const { isPaid } = useTrafficGate();
  const { forceAds } = useAdGate();
  const show = isPaid || forceAds;
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !show) return;
    // @ts-expect-error - _taboola는 TaboolaLoader가 주입하는 전역
    window._taboola = window._taboola || [];
    // @ts-expect-error - _taboola는 TaboolaLoader가 주입하는 전역
    window._taboola.push({
      mode,
      container: containerId,
      placement,
      target_type: targetType,
    });
    pushed.current = true;
  }, [show, containerId, mode, placement, targetType]);

  if (!show) return null;

  return <div id={containerId} className={cn("not-prose", className)} />;
}
