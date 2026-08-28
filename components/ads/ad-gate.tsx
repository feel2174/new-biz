"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * 페이지 단위 광고 게이팅 해제 신호.
 *
 * 트래픽 게이팅(유료 유입 전용 노출, useTrafficGate)과는 별개로, 특정 페이지
 * (post.ungateAds)는 다이렉트 접속을 포함한 모든 유입에 AdSense 광고를 노출해야 한다.
 * 이때 광고 슬롯(<ins>)뿐 아니라 AdSense 로더 스크립트(adsbygoogle.js)도 로드돼야
 * 슬롯이 채워진다 — 로더가 isPaid에서만 주입되면 슬롯만 생기고 빈 채로 남는다.
 *
 * ungate 페이지가 <ForceAds />를 렌더하면 forceAds=true가 되고, AdSenseScript가
 * 이를 읽어 다이렉트 접속에서도 로더를 주입한다.
 */
const AdGateContext = createContext<{
  forceAds: boolean;
  setForceAds: (v: boolean) => void;
}>({ forceAds: false, setForceAds: () => {} });

export function AdGateProvider({ children }: { children: ReactNode }) {
  const [forceAds, setForceAds] = useState(false);
  return (
    <AdGateContext.Provider value={{ forceAds, setForceAds }}>
      {children}
    </AdGateContext.Provider>
  );
}

export function useAdGate() {
  return useContext(AdGateContext);
}

/**
 * ungate 페이지(post.ungateAds)에서 렌더한다. 마운트되어 있는 동안 forceAds를 켜고
 * (다른 페이지로 이동해 언마운트되면 다시 끈다), 그 결과 AdSenseScript가 로더를 로드한다.
 */
export function ForceAds() {
  const { setForceAds } = useAdGate();
  useEffect(() => {
    setForceAds(true);
    return () => setForceAds(false);
  }, [setForceAds]);
  return null;
}
