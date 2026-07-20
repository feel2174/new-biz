# biz.zucca100.com 콘텐츠 페이지 제작 플레이북

이 문서는 다른 세션/다른 대화에서도 동일한 형태(정보형 랜딩 + 게이팅 CTA)의
페이지를 재현할 수 있도록, 지금까지 반복해서 검증된 제작 방식을 기록한다.

관련 문서: [naver-action-landing-template.md](./naver-action-landing-template.md)
— 구조화된 `actionGuide` 스키마(작업형 랜딩) 전용 상세 템플릿. 이 문서는 그보다
넓은 범위(기본 `contentHtml` 방식 포함, 리서치·컴플라이언스·검증·git 워크플로우)를 다룬다.

---

## 1. 사이트 구조 개요

- Next.js App Router + 로컬 콘텐츠 시스템. WordPress 헤드리스는 별개 소스이며,
  로컬 글이 있으면 로컬을 우선 렌더한다.
- 데이터: `content/posts.json` (배열) + `lib/local-posts.ts` (타입·조회 함수).
- 렌더링: `app/posts/[slug]/page.tsx`의 `LocalPostView`.
- 글 하나(`LocalPost`)는 두 가지 본문 방식 중 하나를 쓴다.

| 필드 | 방식 | 언제 쓰나 |
|---|---|---|
| `contentHtml` (+ `<!--CTA:n-->` 마커) | 자유 형식 HTML 문자열 | **기본값. 이 문서에서 다루는 40여 개 글 전부 이 방식** |
| `actionGuide` (구조화 객체) | 컴포넌트가 렌더하는 정형 템플릿(작업 카드형) | 네이버가 "브랜드명 단독 키워드"를 반려하고 "브랜드명+작업/방법" 형태를 요구할 때. 자세한 스키마는 위 관련 문서 참고 |

`actionGuide`가 있으면 `contentHtml`보다 우선 렌더된다(`page.tsx`의
`post.actionGuide ? <ActionGuideLanding .../> : ...` 분기).

---

## 2. 트래픽 게이팅 (핵심 — 반드시 이해할 것)

파일: `components/traffic/traffic-gate.tsx`

### 원칙

- **다이렉트 접속(네이버 검수용)**: CTA 버튼·하단 메뉴·AdSense 전부 숨김 → 깨끗한 페이지.
- **유료 광고 유입**: 위 요소 전부 노출.
- 판정은 **랜딩 URL의 쿼리스트링 + referrer**로 클라이언트에서 1회 수행하고,
  세션 동안 `sessionStorage(tg_paid)`로 유지한다(내부 이동 시 파라미터가 사라져도 유지).
- 직접 URL로 다시 들어오면(파라미터 없이) 매번 재판정하며, 유료가 아니면
  기존 세션 상태도 지운다 — 같은 브라우저에서 "검수용 다이렉트"와 "광고 클릭"이
  섞이지 않도록 하기 위함.

### 유료로 인정하는 신호 (전부 `detectPaidTraffic` 안에 있음)

| 종류 | 조건 |
|---|---|
| 네이버 | `NaPm`, `n_media`, `n_query`, `n_rank`, `n_ad_group`, `n_ad`, `n_keyword`, `n_keyword_id`, `n_campaign_type`, `n_contract` — **키만 있으면** 값 무관 |
| 카카오/다음 | `kakao_ad`, `kakaoAd`, `kakaoad` — 키만 있으면 값 무관 |
| 구글 | `gclid`, `gclsrc`, `gad_source`, `wbraid`, `gbraid` — 키만 있으면 값 무관 |
| utm_medium | 값이 `cpc`/`ppc`/`paid`/`powerlink`/`keyword`/`moment`/`paid-search`/`paidsearch` 중 하나(대소문자 무관) — **단독으로도 인정** |
| utm_source | 값에 `powerlink` 문자열 포함 시 |
| referrer(보조) | `ad.search.naver.com`, `ad.daum.net`, `googleadservices.com`, `doubleclick.net` 등 광고 네트워크 도메인 |

> 주의: 위 목록에 없는 임의 파라미터(`?foo=bar` 등)는 유료로 인정되지 **않는다**.
> "쿼리 파라미터가 붙으면 무조건"이 아니라 이 정해진 목록만 인정한다.

### 테스트 방법

```
https://biz.zucca100.com/posts/{slug}                     -> 다이렉트(CTA/광고 없음, 검수 화면)
https://biz.zucca100.com/posts/{slug}?utm_medium=cpc       -> 유료(CTA/광고 노출)
https://biz.zucca100.com/posts/{slug}?n_query=테스트        -> 유료(네이버 파워링크 흉내)
```

### 구현 시 반드시 지킬 것

- `PaidOnly`로 감싼 요소는 **서버/초기 클라이언트 렌더에서 항상 비노출** → 마운트 후에만 조건부 노출(하이드레이션 불일치 방지).
- 서버 컴포넌트 안에서 `<a onClick={...}>`를 직접 만들면 **RSC 경계 에러**
  ("Event handlers cannot be passed to Client Component props")가 난다.
  CTA/게이팅 관련 인터랙티브 요소는 반드시 별도 `"use client"` 파일로 분리한다
  (`components/cta/cta-link.tsx`, `components/cta/gated-action-link.tsx` 참고).
- CTA `<a>` 태그에 `target="_blank"`를 **절대 넣지 않는다**(같은 탭 이동, 사이트 전체 정책).
- 광고/제휴 대상이 아닌 외부 사이트(예: 공식 홈페이지 도메인)를 본문에서 언급할 때,
  요청에 따라 하이퍼링크 없이 **순수 텍스트**로만 표기해야 하는 경우가 있다
  (예: `www.railcruise.co.kr`처럼 `<a href>` 없이 그냥 문자열로만 적기). 소재 심사 리스크를
  줄이기 위한 지시가 있으면 반드시 따른다.

---

## 3. CTA 배치 패턴 (`contentHtml` 방식)

### 마커 시스템

본문 HTML 문자열 안에 `<!--CTA:0-->`, `<!--CTA:1-->` ... 처럼 넣으면, 렌더 시
`post.contentHtml.split(/<!--CTA:(\d+)-->/)`로 쪼개서 해당 인덱스의
`post.cta[n]`을 그 위치에 `CtaLink`로 삽입한다. 같은 인덱스를 여러 번 재사용해도 된다
(동일 버튼을 여러 위치에 반복 배치 가능).

마커가 하나도 없으면 예전 방식(본문 최상단에 CTA 전부 몰아서 렌더)으로 자동 폴백된다 —
새 글은 항상 마커를 쓴다.

### 배치 원칙 (여러 차례 조정 끝에 정착한 기준)

- **CTA는 3개, 상단·중단·하단**이 기본값. 5개까지 늘렸다가 사용자 요청으로 3개로 줄인 전례가 있음
  — 너무 많으면 스팸처럼 보이므로 과하게 늘리지 않는다.
- 위치는 "본문 텍스트(태그 제외) 기준 몇 % 지점인가"로 계산해서 상/중/하단을 고른다.
  ```js
  const total = contentHtml.replace(/<[^>]+>/g, "").length;
  // 각 <!--CTA:n--> 위치까지의 텍스트 길이 / total * 100 으로 %를 구해 배치 확인
  ```
- **상단**: 요약문(excerpt) 바로 아래, 즉 본문 첫 `<h2>` 앞이나 첫 문단 뒤.
- **중단**: 본문 40~60% 지점, 대개 핵심 정보 섹션(가격/조회/신청 방법 등)을 읽은 직후.
- **하단**: FAQ 뒤, 글 맨 끝.
- 페이지에 서로 다른 두 개 이상의 목적지(예: 앱A + 앱B, 또는 주제A + 관련 서비스B)를
  다룰 때는 각각 별도 `cta[]` 항목을 만들어 **관련 설명 문단 바로 뒤**에 배치한다
  (예: "숨은 돈 찾기" 섹션에서 어카운트인포용 버튼과 내보험찾아줌용 버튼을 각각 다른 문단 뒤에 배치).

### 버튼 문구(후킹 카피)

- 밋밋한 "OO 바로가기" 하나만 반복하지 않는다. 위치별로 다른 후킹 문구를 쓴다.
  예: `지금 바로 OO 확인하기`, `OO 통합조회 바로가기`, `지금 바로 OO 시작하기`.
- 버튼 직전에 굵게(`<strong>`) 한 줄 후킹 문장을 넣는 패턴을 자주 쓴다:
  ```html
  <p><strong>지금 바로 어카운트인포에서 내 계좌를 확인해보세요.</strong></p><!--CTA:1-->
  ```
  이 문장은 `PaidOnly` 밖(일반 `Article` 본문)이라 **다이렉트 접속에서도 그대로 보인다** —
  버튼만 숨고 문구는 남는다는 점을 기억할 것.

### `posts.json`에서 `cta` 배열 예시

```json
"cta": [
  { "label": "지금 바로 OO 확인하기", "href": "https://zucca100.com/{slug}/" },
  { "label": "OO 통합조회 바로가기", "href": "https://zucca100.com/{slug}/" },
  { "label": "지금 바로 OO 시작하기", "href": "https://zucca100.com/{slug}/" }
]
```

---

## 4. GA4 트래킹

- `app/layout.tsx`의 `<head>`에 gtag.js 로더 + `gtag('config', 'G-...')`가
  **게이팅 없이 항상** 로드된다(전체 트래픽 애널리틱스는 유료/다이렉트 구분 없이 측정 목적).
  측정 ID는 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 환경변수로 재정의 가능(기본값 하드코딩 fallback 있음).
- CTA 클릭 시 `CtaLink`/`GatedActionLink`가 `gtag('event', 'cta_click', { button_name, link_url, ...naverAdParams })`를 전송한다.
  - `button_name`은 보통 `${post.slug}-cta${index}` 형태로 자동 생성.
  - `naverAdParams`는 랜딩 시 감지된 `n_query`/`n_keyword`/`n_ad_group`/`n_rank` 등을
    세션에 저장해뒀다가 클릭 이벤트에 함께 실어 보낸다 — "어떤 네이버 키워드가 어떤 버튼
    클릭으로 이어졌는지"를 이벤트 하나로 바로 볼 수 있게 하기 위함.
  - 랜딩 시 네이버 광고 파라미터가 처음 감지되면 `naver_ad_landing` 이벤트도 1회 전송.
- **GA4 관리자 쪽에서 별도로 해야 하는 일** (코드로 해결 안 됨):
  - 관리 → 맞춤 정의 → 맞춤 측정기준 등록: `button_name`, `link_url`, `n_query`, `n_keyword`,
    `n_ad_group`, `n_rank`, `n_ad`, `n_keyword_id`, `n_campaign_type`, `n_contract` — 등록해야
    탐색(Explore) 보고서에서 분해해서 볼 수 있다. 등록 전에도 이벤트 자체는 실시간/이벤트
    보고서에 잡힌다.
  - `cta_click`을 주요 이벤트(전환)로 표시하려면 관리 → 이벤트에서 설정.

---

## 5. 콘텐츠 제작 워크플로우 (한 페이지 기준)

1. **원문 URL 확인**: `curl -s -o /dev/null -w "%{http_code}\n" "https://zucca100.com/{slug}/"` 로 200인지 확인.
   URL이 percent-encoding된 한글이면 그대로 사용(디코딩하지 않음).
2. **`content/posts.json`에 같은 slug가 이미 있는지 확인**(`node -e "..."`로 grep).
3. **WebFetch로 원문 구조 추출** — 제목, 소제목 구조, 핵심 정보, 기존 CTA 문구/링크 대상까지 물어본다.
4. **WebSearch로 사실 검증·보강** — 원문을 그대로 베끼지 않는다. 특히:
   - 최신 수치(가격, 지원금액, 신청기간)는 여러 출처를 교차 확인하고, 출처마다 다르면
     "매년/시기에 따라 달라질 수 있다"는 헤지 표현을 쓴다.
   - 원문에 있는 주장(효능, 비교우위 등)을 검증 없이 베끼지 않는다.
5. **키워드 리스트를 받으면 먼저 분류한다** (§7 참고).
6. **본문 작성** — 아래 구조를 기본으로 한다.
   - 도입(정의/뜻) → CTA(상단) → 핵심 정보 섹션들 → CTA(중단, 후킹 문구 포함) →
     심화/트러블슈팅/비교 섹션 → CTA(하단) → FAQ.
   - 긴 문단(4문장 이상)은 쪼갠다. FAQ는 질문마다 별도 `<p>`로 분리한다(한 덩어리로 뭉치지 않기).
   - 이미지가 주어지면 `coverImage` 필드에 `/imgs/{파일명}` 경로로 넣는다
     (실제 파일은 `public/imgs/{파일명}`에 있어야 함).
7. **키워드 커버리지 자동 검증** — 요청받은 키워드 리스트를 배열로 만들어
   `contentHtml.includes(keyword)`로 전수 검사하는 node 스크립트를 짜서 돌린다.
   빠진 것은 자연스러운 문장으로 보강한다(§8 "동의어 나열 기법" 참고).
8. **검증** (§9 체크리스트).
9. **git status/fetch 확인 → 커밋 → push** (§10, 매번 새로 확인. 이전에 확인했다고 넘겨짚지 않는다).

---

## 6. 스크립트 작성 시 기술적 함정 (실제로 반복해서 겪은 문제들)

- **`content/posts.json`은 실제로 CRLF(`\r\n`) 줄바꿈**이다. 여러 줄에 걸친 raw 문자열을
  통째로 매칭하는 스크립트를 짤 때 `\n`을 쓰면 안 맞는다. 안전한 방법:
  - `title`/`excerpt`/`contentHtml`처럼 **한 줄짜리 JSON 문자열 값**은
    `JSON.stringify(oldValue)`를 needle로 써서 `raw.indexOf(...)`로 찾으면 줄바꿈 이슈가 없다
    (권장 — 이 문서의 예시 대부분이 이 방식).
  - `cta` 블록처럼 여러 줄에 걸친 구조를 바꿀 때만 실제 파일을 먼저 `node -e`로 열어
    정확한 원문(공백, `\r\n` 위치 포함)을 확인한 뒤 정확히 그 문자열로 치환한다.
- **Bash `-c` 인라인으로 한국어+따옴표가 많이 섞인 긴 스크립트를 짜면 quoting이 깨진다.**
  Write 툴로 `.js` 파일을 스크래치 디렉터리에 만들고 `node 파일경로`로 실행하는 방식이 안전하다.
- **서버 컴포넌트에 `onClick` 직접 정의 금지** — §2 참고. 반드시 클라이언트 컴포넌트로 분리.
- **dev 서버가 오래 켜져 있으면 Turbopack/Jest worker가 크래시해서 500이 난다**
  (`Jest worker encountered N child process exceptions`). 이건 콘텐츠 문제가 아니라 dev 서버
  자체 문제다. `pkill -f "next dev"` → `rm -rf .next` → `pnpm dev` 재시작으로 해결.
  포트 3000이 이미 점유돼 있으면 3001 등으로 자동 전환되니, curl로 확인할 때 실제 포트를
  로그에서 다시 확인할 것.
- **`pnpm build`가 통과했는데 dev 서버가 500을 내면** dev 서버 쪽 문제일 가능성이 높다 —
  `pnpm build` 성공이 더 신뢰할 수 있는 신호다.

---

## 7. 네이버 광고 심사 대응 원칙 (키워드 분류)

키워드 리스트를 받으면 아래 4그룹으로 나눠서 접근한다. 실제 반려 사유로 확인된 문구:

> "사이트의 주된 콘텐츠는 각 상품에 대한 리뷰/정보제공 콘텐츠로 판단됨에, 리뷰/정보제공
> 브랜드명+리뷰, 정보, 후기 등의 확장 키워드로 구매하여주시기 바랍니다"

| 그룹 | 정의 | 대응 |
|---|---|---|
| **A. 브랜드명 없는 순수 일반어** | 예: "바둑", "무료바둑게임", "정확한날씨어플" | **페이지를 아무리 바꿔도 승인 불가.** 광고 계정에서 제외를 권장한다(사용자에게 명시적으로 이렇게 안내). |
| **B. 브랜드+정보성 접미사 없음** | 예: "피망바둑", "타이젬바둑다운로드" | 페이지 제목에 **"정보"**를 명시하고("...가이드/총정리" → "...정보 총정리"), "다운로드" 중심 프레임을 "정보/사용법/비교" 프레임으로 바꾸면 승인 가능성 있음. |
| **C. 트러블슈팅/작업형** | 예: "로그인오류", "설치안됨", "예약취소" | 해당 문제를 실제로 다루는 **전용 섹션을 신설**한다(팝업차단 해제, 백신 예외, 재설치, 관리자 권한 실행 등 실제 해결책). |
| **D. 검색 의도 자체가 다른 것** | 예: 소비자용 앱 페이지에 붙는 "OpenAPI", "자바스크립트 연동" 같은 개발자용 키워드 | 페이지 주제와 근본적으로 안 맞으므로 **억지로 다루지 않고 제외 권장**. 무리하게 넣으면 페이지의 주제 일관성만 흐려짐. |

### 압축된 키워드 변형이 대량으로 올 때 (예: "OO예약날짜", "OO예약기간", "OO예약오픈시간" 등)

억지로 모든 조합을 문장에 우겨넣지 않는다. 대신 "동의어 나열" 기법을 쓴다:

```html
<p>OO예약오픈(OO예약오픈시간)은 보통 출발일 기준 1~2개월 전에 열립니다.
OO예약언제, OO예약일정, OO예약날짜, OO예약기간 모두 이 예약 오픈 시점을
가리키는 표현이며, 시즌마다 조금씩 달라질 수 있습니다.</p>
```

한 문장 안에 여러 압축 변형을 자연스럽게 묶어서 나열하면, 스팸처럼 보이지 않으면서
문자열 커버리지를 동시에 확보할 수 있다.

### "직접접속에서도 보여야 한다"는 요청이 오면

`contentHtml` 본문(Article로 렌더되는 부분)은 **원래부터 게이팅과 무관하게 항상 노출**된다.
게이팅되는 건 CTA 버튼과 AdSense 광고 유닛뿐이다. 따라서 "이 키워드는 다이렉트 접속에서도
보이게 해달라"는 요청은 **해당 주제를 CTA 훅 문구에만 슬쩍 걸치지 말고, 전용 H2/H3 섹션으로
당당히 다뤄달라**는 뜻으로 이해하고, 그렇게 작성한 뒤 실제로 curl로 다이렉트 접속 결과에
그 문자열이 있는지 확인해서 근거를 남긴다.

---

## 8. 정확성·컴플라이언스 원칙 (중요 — 위반 시 리스크 큼)

- **원문을 그대로 베끼지 않는다.** 특히 과장된 주장이 있으면 검증 후 다시 쓴다.
- **식품/건강 관련 콘텐츠는 효능·의학적 효과를 단정하지 않는다.**
  - 성분 함량(예: "안토시아닌 함량이 블랙베리보다 높다")처럼 측정 가능한 사실은 서술 가능.
  - "노화 방지", "면역력 강화", "염증 완화"처럼 효과를 단정하는 표현은 **식품표시광고법 위반
    소지**가 있고, 실제로 이런 표현을 쓴 하스카프베리 판매자들이 부당광고로 적발된 사례가
    확인됐다. "효능" 관련 키워드가 와도, 효능을 주장하는 대신 **"이런 표현은 조심해야 한다"는
    사실 자체를 콘텐츠로 만드는 것**이 안전하고 실제로 유용하다.
- **금융 서비스는 서비스 범위를 정직하게 구분한다.** 어떤 서비스가 다루지 않는 영역을
  마치 다루는 것처럼 쓰지 않는다. 예:
  - 어카운트인포(계좌/카드포인트/대출)는 휴면보험금을 다루지 않음 → 내보험찾아줌으로 정확히 리다이렉트.
  - 건강보험료 환급은 어카운트인포가 아니라 국민건강보험공단/정부24 소관.
  - 원기날씨(서드파티 앱)와 기상청 날씨알리미(공식 앱)와 기상청 날씨누리(공식 웹사이트, 앱 아님)는
    서로 다른 서비스이며, 이 차이를 "OO 앱 다운로드 안됨" 같은 키워드의 실제 원인으로 설명하면
    검색 의도를 정확히 충족시키면서도 정직하다.
- **비슷하지만 다른 서비스/앱은 "뭐가 다를까" 비교 섹션으로 명시적으로 구분한다**
  (예: 매일미사 앱 vs 가톨릭굿뉴스 앱, 한게임 vs 타이젬 vs 넷마블 바둑).
- **규제 리스크가 높은 카테고리는 신중히 판단한다.**
  - 대출 광고: 대부업법상 법정 고지문구(금리, 연체이자율 등) 요건이 있어 일반 정보 페이지보다 문턱이 높음.
  - 보험 비교/추천: "보험 비교"라는 표현 자체가 금융위 등록 사업자만 쓸 수 있는 표현일 수 있음.
  - 이런 카테고리는 착수 전에 사용자에게 리스크를 명시적으로 알리고 진행 여부를 확인한다.
- **광고 CTA 목적지는 항상 `zucca100.com/{원문 slug}/`로 연결**한다(그 원문이 다시 실제 서비스로
  안내하는 구조). 원문에 CTA가 `plus.zucca100.com/...`로 되어 있어도, biz 쪽 CTA는 관례상
  `zucca100.com/{slug}/`로 건다 — 지금까지 40개 가까운 글에서 예외 없이 지켜진 패턴이다.

---

## 9. 검증 체크리스트 (매 페이지 공통, 빠짐없이)

```bash
# 1) JSON 유효성
node -e "JSON.parse(require('fs').readFileSync('content/posts.json','utf8'));console.log('ok')"

# 2) 타입체크
npx tsc --noEmit -p tsconfig.json

# 3) 프로덕션 빌드 (가장 신뢰할 수 있는 신호)
pnpm build

# 4) dev 서버로 실제 렌더 확인 (포트는 로그에서 확인, 3000이 막혀 있으면 3001 등)
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:PORT/posts/{slug}"                    # 200
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:PORT/posts/{slug}?utm_medium=cpc"      # 200
curl -s "http://localhost:PORT/posts/{slug}" | grep -oE '<a[^>]*pulse-cta[^>]*>' | wc -l          # 0 (다이렉트엔 버튼 없어야 함)
curl -s "http://localhost:PORT/posts/{slug}" | grep -o 'target="_blank"' | wc -l                  # 0
```

- [ ] 원문 URL 200 확인
- [ ] slug 중복 없음
- [ ] 요청받은 키워드 전부 커버리지 스크립트로 검증(빠진 것 보강)
- [ ] 효능/과장/규제 위반 표현 없는지 재점검
- [ ] CTA 3개(상/중/하단), 위치별 다른 후킹 문구
- [ ] `target="_blank"` 없음
- [ ] 이미지(`coverImage`) 지정했다면 실제 파일 존재 + 렌더 확인
- [ ] JSON valid / tsc pass / build pass
- [ ] dev 서버: 다이렉트 200 + pulse-cta 0개, 유료(`?utm_medium=cpc`) 200

---

## 10. Git 워크플로우 (반복해서 실수했던 부분 — 특히 주의)

- **"검토했다"와 "커밋/푸시했다"는 다르다.** 검증까지 마치고 사용자에게 "커밋/푸시할까요?"라고
  물었으면, 사용자가 확답할 때까지 실제로 커밋하지 않는다. 그리고 확답을 받으면 **반드시 그 턴에
  바로 커밋/푸시까지 실행**한다 — "다음에 하겠다"고 넘어갔다가 몇 턴 뒤에 사용자가 "왜 반영이
  안 되냐"고 묻는 일이 이 프로젝트에서 여러 번 있었다.
- 커밋 전에 항상:
  ```bash
  git status --short
  git fetch origin main --quiet
  git log origin/main..HEAD --oneline   # 로컬에만 있는 커밋
  git log HEAD..origin/main --oneline   # 원격에만 있는 커밋(다른 세션이 먼저 푸시했을 수 있음)
  ```
- 원격에 다른 세션이 먼저 푸시한 커밋이 있으면(`git push`가 `[rejected]`로 거부됨),
  `git pull --rebase origin main`으로 병합한다. `content/posts.json`은 배열이라 서로 다른
  글을 추가한 경우 대개 충돌 없이 깨끗하게 rebase된다. 병합 후 두 변경 모두 남아 있는지
  `node -e`로 확인하고 나서 push한다.
- 커밋 메시지는 무엇을 왜 바꿨는지 한국어로 간결하게, 근거(검색으로 확인한 사실, 반려 사유 등)를
  한두 줄 남긴다 — 나중에 다른 세션이 이 로그만 보고도 맥락을 알 수 있게.

---

## 11. 새 페이지 스캐폴드 (복붙용 뼈대)

```js
// scratchpad/add-XXX.js — node 로 직접 실행
const fs = require("fs");
const file = "C:\\Users\\devzu\\Documents\\nextjs-wordpress-headless-cms\\content\\posts.json";
let raw = fs.readFileSync(file, "utf8");
const arr = JSON.parse(raw);
if (arr.some((x) => x.slug === "SLUG")) throw new Error("already exists");

const href = "https://zucca100.com/ORIGINAL-SLUG/";
const html = [
  "<h2>...란?</h2>",
  "<p>...</p>",
  "<!--CTA:0-->",
  "<h2>핵심 정보 섹션</h2>",
  "<p>...</p>",
  "<p><strong>지금 바로 ... 확인해보세요.</strong></p><!--CTA:1-->",
  "<h2>자주 묻는 질문</h2>",
  "<p><strong>Q1?</strong> A1.</p>",
  "<p><strong>Q2?</strong> A2.</p>",
  "<p><strong>지금 바로 ... 확인해보세요.</strong></p><!--CTA:2-->",
].join("");

const post = {
  slug: "SLUG",
  title: "OO 정보 총정리 — 핵심 키워드 몇 개",
  excerpt: "한두 문장 요약.",
  date: "2026-07-20T09:00:00",
  category: "생활정보",
  cta: [
    { label: "지금 바로 OO 확인하기", href },
    { label: "OO 관련 작업 바로가기", href },
    { label: "지금 바로 OO 시작하기", href },
  ],
  contentHtml: html,
};

const j = (s) => JSON.stringify(s);
const block =
  "  {\n" +
  '    "slug": ' + j(post.slug) + ",\n" +
  '    "title": ' + j(post.title) + ",\n" +
  '    "excerpt": ' + j(post.excerpt) + ",\n" +
  '    "date": ' + j(post.date) + ",\n" +
  '    "category": ' + j(post.category) + ",\n" +
  '    "cta": [\n' +
  post.cta.map((c) => '      { "label": ' + j(c.label) + ', "href": ' + j(c.href) + " }").join(",\n") +
  "\n    ],\n" +
  '    "contentHtml": ' + j(post.contentHtml) + "\n  }";

const trimmed = raw.replace(/\s*$/, "");
const beforeBracket = trimmed.slice(0, -1).replace(/\s*$/, "");
fs.writeFileSync(file, beforeBracket + ",\n" + block + "\n]\n");
console.log("added:", post.slug);
```

이미지를 쓸 경우 `post`에 `"coverImage": "/imgs/파일명.png"`를 추가하고, 위 블록 생성
문자열에도 `'    "coverImage": ' + j(post.coverImage) + ",\n" +`를 `category` 다음 줄에 끼워 넣는다.
실제 파일은 `public/imgs/파일명.png`에 있어야 한다.
