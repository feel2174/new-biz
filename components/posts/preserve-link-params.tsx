"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 본문(contentHtml/content.rendered)은 dangerouslySetInnerHTML로 꽂히는 원시 HTML이라
 * 내부 "/posts/{slug}" 링크에 현재 진입 URL의 쿼리스트링(NaPm·n_query 등 네이버 광고
 * 파라미터 포함)이 붙어있지 않다. 그대로 두면 내부링크 클릭 시 쿼리가 사라져
 * TrafficGateProvider가 다음 페이지를 다이렉트 접속으로 오판(광고 유입 상태 초기화)한다.
 * 마운트 시점에 현재 쿼리스트링을 내부링크 href에 그대로 이어붙여 이 문제를 막는다.
 */
export function PreserveLinkParams({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const search = window.location.search;
    if (!search) return;
    const currentParams = new URLSearchParams(search);

    ref.current
      ?.querySelectorAll<HTMLAnchorElement>('a[href^="/posts/"]')
      .forEach((anchor) => {
        const [path, existingQuery] = anchor.getAttribute("href")!.split("?");
        const params = new URLSearchParams(existingQuery ?? "");
        currentParams.forEach((value, key) => {
          if (!params.has(key)) params.set(key, value);
        });
        const qs = params.toString();
        anchor.setAttribute("href", qs ? `${path}?${qs}` : path);
      });
  }, []);

  return <div ref={ref}>{children}</div>;
}
