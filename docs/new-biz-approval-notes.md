# 생활정보 나침반 — 네이버 비즈채널 승인 세팅 노트

이 프로젝트는 `nextjs-wordpress-headless-cms`(biz.zucca100.com)의 시스템을 복제해
**신규 비즈채널용 독립 정보 사이트**로 세팅한 것이다. 아키텍처(트래픽 게이팅·CTA·GA4·
AdSense)는 원본과 동일하며, 콘텐츠·정체성·신뢰 페이지를 새로 구성했다.

관련 참고: [content-page-playbook.md](./content-page-playbook.md),
[naver-action-landing-template.md](./naver-action-landing-template.md)

---

## 1. 무엇을 바꿨나 (원본 대비)

- **정체성**: `site.config.ts` → 사이트명 "생활정보 나침반", 도메인 `https://new-biz.zucca100.com`.
- **소스 분리**: `.env.local`의 `WORDPRESS_URL`을 비움 → WordPress 헤드리스 미사용, `content/posts.json` 로컬 콘텐츠만으로 동작. (biz.zucca100.com WP 글이 섞여 들어오지 않음)
- **콘텐츠 교체**: 원본 41개 글을 걷어내고, **신규 정보성 6편**으로 새로 작성(중복 콘텐츠 회피 + 명확한 정보 제공 사이트).
- **신뢰 페이지 신설**: `/about`, `/privacy`, `/terms`, `/contact` 를 로컬 라우트로 생성(원본은 WordPress 페이지였음).
- **메뉴/푸터 재배선**: `/pages/*`, `/senior`(빈 페이지) 제거 → 로컬 신뢰 페이지로 연결. 운영자·개인정보책임자 정보 갱신.

## 2. 콘텐츠 6편 (모두 정보성·과장/규제표현 배제, 2026 수치 검증)

| slug | 주제 | 카테고리 | CTA 목적지(원문, 200 확인) |
|---|---|---|---|
| driver-license-reissue | 운전면허증 재발급 방법·수수료 | 생활정보 | zucca100.com/driver-license-request/ |
| car-tax-annual | 자동차세 연납 신청·할인율(2026) | 생활정보 | zucca100.com/car-tax/ |
| mobile-id-issue | 모바일 신분증 발급·사용처 | 통신/IT | zucca100.com/mobile-id/ |
| parental-leave-pay | 육아휴직급여 신청·금액(2026) | 정부지원/정책 | zucca100.com/parental-leave-benefits/ |
| gyeonggi-youth-point | 경기도 청년 복지포인트 자격·신청 | 정부지원/정책 | zucca100.com/youth-welfare-point/ |
| worknet-jobseeker | 워크넷 구직등록·실업급여 연계 | 취업 | zucca100.com/work-net/ |

- 각 글: CTA 3개(상단~26% / 중단 43~66% / 하단 100%), 위치별 다른 후킹 문구, FAQ 포함.
- 검증된 수치: 자동차세 1월 연납 할인율 **약 4.58%(2026)**, 육아휴직 2026 개편(1~6개월 통상임금 100%·사후지급금 폐지, 6+6 특례 6개월차 상한 450만).

## 3. 네이버 비즈채널 승인 전략 (반영된 것)

- **주된 콘텐츠 = 정보 제공형**으로 명확화: 제목에 "신청 방법·자격·정보 총정리" 프레이밍(브랜드명 단독/순수 일반어 회피).
- **신뢰 신호 확보**: 소개·개인정보처리방침·이용약관·문의 페이지 + 운영자/개인정보책임자/이메일 명시(심사 시 자주 확인하는 항목).
- **깨끗한 검수 화면**: 다이렉트 접속 시 CTA·AdSense 전부 숨김(트래픽 게이팅). 본문 정보는 항상 노출 → 검색 의도 충족.
- **규제 리스크 회피**: 건강 효능·대출·보험 비교 등 고위험 카테고리 배제. 정부·공공 서비스 안내 위주로 구성.
- **정확성**: 수치는 발표 시점 기준 표기 + "매년 달라질 수 있으니 공식 채널 확인" 헤지.

## 4. 배포 전 반드시 해야 할 일 (수동)

1. **도메인**: `site.config.ts`의 `site_domain` = `https://new-biz.zucca100.com` (설정 완료). 배포 환경 DNS·호스팅 연결만 확인.
2. **운영자 정보 확인**: 푸터/`/about`/`/privacy`의 개인정보 보호책임자(김영주)·이메일(devzucca@gmail.com)이 실제 정보와 맞는지 최종 확인.
3. **GA4 신규 속성**: 이 사이트 전용 GA4 측정 ID를 `.env.local`의 `NEXT_PUBLIC_GA_MEASUREMENT_ID`에 설정(현재 fallback은 biz 사이트 것).
4. **AdSense 슬롯**: 승인 후 광고 유닛 슬롯 ID를 `.env.local`에 채움. (게시자 ID는 계정 단위라 유지 가능)
5. **CTA 목적지 최종 점검**: 위 표의 zucca100.com 원문이 계속 200인지 확인.
6. **비즈채널 등록**: 네이버 검색광고 → 비즈채널에 실제 도메인 URL 등록 후 검수 요청.
7. **키워드 구매 원칙**: 순수 일반어("운전면허증", "자동차세")보다 "OO 신청방법/재발급/조회" 같은 정보·작업형 확장 키워드 위주로 등록(반려 사유 대응, 플레이북 §7 참고).

## 5. 검증 결과 (2026-07-20)

- `JSON.parse` OK · `tsc --noEmit` 통과 · `pnpm build` 성공(24개 라우트, 6개 글 프리렌더).
- dev(3002) curl: 다이렉트 200 / `pulse-cta` 0 / `target="_blank"` 0, 유료(`?utm_medium=cpc`) 200, 신뢰·홈·블로그 전부 200, sitemap에 6 slug 포함.
