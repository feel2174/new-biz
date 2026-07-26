"use client";

import { useEffect, useRef } from "react";
import { useTrafficGate } from "@/components/traffic/traffic-gate";

/**
 * Taboola flush 신호. </body> 끝에 해당하는 위치(app/layout.tsx의 Footer 뒤)에 1회만
 * 렌더한다. TrafficGateProvider 하위 형제 컴포넌트들은 effect가 선언 순서대로 실행되므로,
 * 이 컴포넌트를 트리 맨 마지막에 두면 그 위에서 렌더된 모든 TaboolaUnit의 push가
 * 끝난 뒤에 flush가 호출됨이 보장된다. 유료 유입이 아니면 아무 것도 하지 않는다.
 */
export function TaboolaFlush() {
  const { isPaid } = useTrafficGate();
  const flushed = useRef(false);

  useEffect(() => {
    if (flushed.current || !isPaid) return;
    // @ts-expect-error - _taboola는 TaboolaLoader가 주입하는 전역
    window._taboola = window._taboola || [];
    // @ts-expect-error - _taboola는 TaboolaLoader가 주입하는 전역
    window._taboola.push({ flush: true });
    flushed.current = true;
  }, [isPaid]);

  return null;
}
