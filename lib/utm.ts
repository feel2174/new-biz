/**
 * 외부 CTA 버튼(new-biz -> zucca100.com 등)의 이동 URL에 유입경로 파라미터를 덧붙인다.
 * - utm_source/medium/campaign/content: 목적지 GA에서 "new-biz발 리퍼럴"을 다른 트래픽과
 *   구분해서 보기 위한 표준 UTM.
 * - naverAdParams: 네이버 파워링크로 new-biz에 랜딩할 때 잡아둔 n_media/n_query 등 원본
 *   파라미터를 그대로 실어 보내, 목적지 사이트가 같은 키워드 단위로 성과를 이어볼 수 있게 한다.
 */
export function buildOutboundHref(
  href: string,
  {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    naverAdParams,
  }: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    naverAdParams?: Record<string, string | undefined> | null;
  }
): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }

  if (utmSource) url.searchParams.set("utm_source", utmSource);
  if (utmMedium) url.searchParams.set("utm_medium", utmMedium);
  if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign);
  if (utmContent) url.searchParams.set("utm_content", utmContent);
  // GA4가 커스텀 디멘션 등록 없이도 "Session manual term"으로 기본 인식하는 필드.
  // 목적지 사이트에 별도 코드가 없어도 네이버 키워드가 표준 리포트에 바로 잡히게 하기 위함.
  if (utmTerm) url.searchParams.set("utm_term", utmTerm);

  if (naverAdParams) {
    for (const [key, value] of Object.entries(naverAdParams)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  return url.toString();
}
