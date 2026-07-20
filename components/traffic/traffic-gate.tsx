"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * 유료 광고 유입(네이버 파워링크/CPC, 구글 유료)에서만 수익화 UI(CTA·하단 메뉴·AdSense)를
 * 노출하기 위한 트래픽 소스 게이팅.
 *
 * - 다이렉트 접속(검수용): isPaid=false → 수익화 UI 전부 숨김 (깨끗한 페이지)
 * - 유료 광고 유입: isPaid=true → 노출
 *
 * 판정은 현재 진입 URL 쿼리스트링 + referrer로 수행한다.
 * 다이렉트 검수 URL과 광고 파라미터가 붙은 URL이 같은 브라우저에서도 명확히 갈리도록,
 * 직접 URL 진입 시 이전 세션의 유료 판정을 복원하지 않는다.
 * 단, 광고 URL로 진입한 뒤 Next.js 내부 이동을 하는 동안에는 provider 상태가 유지된다.
 *
 * 비고: Google Ads 비용 매칭(전환/비용 API)은 사용하지 않는다. 수익은 전적으로
 * AdSense URL 단위 수익/RPM 기준으로 집계되며, 본 게이팅은 "노출 대상"만 제어한다.
 */

const STORAGE_KEY = "tg_paid";
const NAVER_AD_STORAGE_KEY = "tg_naver_ad";

// 네이버 광고 유입 시 부착되는 파라미터
// NaPm: 네이버 통합 광고 추적 파라미터(파워링크/검색광고). n_*: 구형 파워링크 파라미터.
const NAVER_PAID_KEYS = [
  "NaPm",
  "n_media",
  "n_query",
  "n_rank",
  "n_ad_group",
  "n_ad",
  "n_keyword",
  "n_keyword_id",
  "n_campaign_type",
  "n_contract",
];

// 카카오/다음 키워드광고 유입 파라미터.
const KAKAO_PAID_KEYS = ["kakao_ad", "kakaoAd", "kakaoad"];

// 유료 매체로 인정하는 utm_medium 값
const PAID_MEDIUMS = [
  "cpc",
  "ppc",
  "paid",
  "powerlink",
  "keyword",
  "moment",
  "paid-search",
  "paidsearch",
];

// 광고 네트워크 referrer (보조 신호)
const PAID_REFERRER_HOSTS =
  /(ad\.search\.naver\.com|adcr\.naver\.com|ad\.daum\.net|display\.ad\.daum\.net|moment\.kakao\.com|googleadservices\.com|doubleclick\.net)/i;

// GA4로 그대로 실어 보낼 네이버 광고 클릭 상세 파라미터
// (검색어·광고그룹·소재·키워드·순위·캠페인유형·계약 등 — 키워드 단위 성과 분석용)
const NAVER_AD_DETAIL_KEYS = [
  "n_media",
  "n_query",
  "n_rank",
  "n_ad_group",
  "n_ad",
  "n_keyword",
  "n_keyword_id",
  "n_campaign_type",
] as const;

export type NaverAdParams = Partial<Record<(typeof NAVER_AD_DETAIL_KEYS)[number], string>>;

export function extractNaverAdParams(search: URLSearchParams): NaverAdParams | null {
  const found: NaverAdParams = {};
  for (const key of NAVER_AD_DETAIL_KEYS) {
    const value = search.get(key);
    if (value) found[key] = value;
  }
  return Object.keys(found).length > 0 ? found : null;
}

// 구글 유료 클릭 파라미터
const GOOGLE_PAID_KEYS = ["gclid", "gclsrc", "gad_source", "wbraid", "gbraid"];

export function detectPaidTraffic(
  search: URLSearchParams,
  referrer: string
): boolean {
  // 1) 네이버 광고 파라미터 (NaPm·n_* 포함)
  if (NAVER_PAID_KEYS.some((key) => search.has(key))) return true;

  // 2) 카카오/다음 광고 파라미터
  if (KAKAO_PAID_KEYS.some((key) => search.has(key))) return true;

  // 3) 구글 유료 클릭 파라미터 (Google Ads 비용 매칭은 하지 않고 유입 판정만)
  if (GOOGLE_PAID_KEYS.some((key) => search.has(key))) return true;

  // 4) utm 기반 유료 유입 (naver/google/kakao 등 공통)
  const utmMedium = (search.get("utm_medium") || "").toLowerCase();
  if (PAID_MEDIUMS.includes(utmMedium)) return true;
  // utm_source에 powerlink 표기(예: powerlink_mohaet) → 파워링크 광고
  const utmSource = (search.get("utm_source") || "").toLowerCase();
  if (utmSource.includes("powerlink")) return true;

  // 5) 광고 네트워크 referrer (보조 신호)
  try {
    if (referrer) {
      const host = new URL(referrer).hostname;
      if (PAID_REFERRER_HOSTS.test(host)) return true;
    }
  } catch {
    // 잘못된 referrer 무시
  }

  return false;
}

const TrafficGateContext = createContext<{
  isPaid: boolean;
  naverAdParams: NaverAdParams | null;
}>({ isPaid: false, naverAdParams: null });

export function TrafficGateProvider({ children }: { children: ReactNode }) {
  const [isPaid, setIsPaid] = useState(false);
  const [naverAdParams, setNaverAdParams] = useState<NaverAdParams | null>(null);

  useEffect(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      const currentIsPaid = detectPaidTraffic(search, document.referrer);

      if (!currentIsPaid) {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(NAVER_AD_STORAGE_KEY);
        setIsPaid(false);
        setNaverAdParams(null);
        return;
      }

      // 네이버 광고 상세 파라미터: 세션 내 이미 저장돼 있으면 그대로 복원,
      // 없고 이번 랜딩 URL에 있으면 최초 1회 저장 + GA4 랜딩 이벤트 전송
      const storedNaverAd = sessionStorage.getItem(NAVER_AD_STORAGE_KEY);
      if (storedNaverAd) {
        setNaverAdParams(JSON.parse(storedNaverAd));
      } else {
        const naverAd = extractNaverAdParams(search);
        if (naverAd) {
          sessionStorage.setItem(NAVER_AD_STORAGE_KEY, JSON.stringify(naverAd));
          setNaverAdParams(naverAd);
          // @ts-expect-error - gtag는 app/layout.tsx head 스크립트가 주입하는 전역
          window.gtag?.("event", "naver_ad_landing", naverAd);
        }
      }

      sessionStorage.setItem(STORAGE_KEY, "1");
      setIsPaid(true);
    } catch {
      const search = new URLSearchParams(window.location.search);
      setIsPaid(detectPaidTraffic(search, document.referrer));
    }
  }, []);

  return (
    <TrafficGateContext.Provider value={{ isPaid, naverAdParams }}>
      {children}
    </TrafficGateContext.Provider>
  );
}

export function useTrafficGate() {
  return useContext(TrafficGateContext);
}

/**
 * 유료 광고 유입에서만 children을 렌더한다. 그 외(다이렉트·크롤러)에는 아무것도 렌더하지 않음.
 * 서버/초기 클라이언트 렌더는 항상 비노출 → 하이드레이션 불일치 없음(마운트 후 조건부 노출).
 */
export function PaidOnly({ children }: { children: ReactNode }) {
  const { isPaid } = useTrafficGate();
  if (!isPaid) return null;
  return <>{children}</>;
}
