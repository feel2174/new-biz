# Handoff — Tier1_즉시집행 키워드 콘텐츠를 new-biz로 이관

작성일: 2026-07-23
작성 세션: `nextjs-wordpress-headless-cms`(biz.zucca100.com) 작업 세션
목적: `C:\Users\devzu\Documents\wp-scraper\네이버광고_즉시집행_키워드추출.xlsx`의
`Tier1_즉시집행` 22개 키워드 중, biz.zucca100.com에 이미 만든 콘텐츠를
**이 프로젝트(new-biz.zucca100.com)에도 등록**하기 위한 인수인계 문서.

이 문서는 다른 세션(= 지금 이 프로젝트를 여는 세션)이 아무 사전 지식 없이도
작업을 이어갈 수 있도록 배경·소스 위치·주의사항·체크리스트를 전부 담는다.

---

## 0. 왜 두 사이트에 나눠 등록하나

biz.zucca100.com과 new-biz.zucca100.com은 **같은 시스템(트래픽 게이팅·CTA·
GA4·AdSense)을 쓰는 별도의 네이버 비즈채널**이다(`docs/new-biz-approval-notes.md`
참고). 키워드를 여러 채널에 나눠 등록해 계정을 확장하려는 목적으로 보이며,
**절대 지켜야 할 원칙은 두 사이트에 완전히 동일한 문장의 글을 올리지 않는 것**이다.
같은 도메인 소유자(zucca100.com 계열)라도 검색엔진 기준 중복 콘텐츠로
잡힐 수 있고, 네이버 심사에서도 불리하게 작용할 수 있다. 아래 §3을 반드시 지킬 것.

---

## 1. 소스 데이터 위치 (원본 참고용, 그대로 복붙 금지)

- 키워드 원장: `C:\Users\devzu\Documents\wp-scraper\네이버광고_즉시집행_키워드추출.xlsx`
  (시트 `Tier1_즉시집행`, 22개 키워드 — 키워드·등급·월검색량·랜딩URL 등)
- biz.zucca100.com에서 이미 만든 참고 콘텐츠(**문장 재사용 금지, 구조·키워드·CTA 목적지만 참고**):
  `C:\Users\devzu\Documents\nextjs-wordpress-headless-cms\content\posts.json`
  아래 7개 slug가 이번 작업분:
  - `gov24-online-document-issuance-guide` (모바일신분증·전입신고·등본·인감증명서·건강보험증, 5항목 묶음 페이지)
  - `car-tax-refund-check-guide` (K패스환급·자동차세납부/환급/조회·통신비환급·환급액조회, 5항목 묶음 페이지)
  - `weekly-paid-holiday-allowance-guide`
  - `parental-leave-benefit-application-guide`
  - `happy-housing-application-guide`
  - `child-tax-credit-application-guide-2026`
  - `old-age-pension-application-guide`

  이 세션에서 `주휴수당·육아휴직급여·행복주택·자녀장려금·노령연금` 묶음 페이지 1개를
  사용자 요청으로 **개별 페이지 5개로 분리**했다(마지막 5개 slug). 문서/세금 환급 2개
  묶음 페이지는 분리하지 않고 그대로 두었다(사용자가 그 부분은 요청하지 않음).

---

## 2. new-biz에 이미 있는 것 — 중복 작업 금지

new-biz는 현재 자체 글 15편을 갖고 있다(`content/posts.json` 직접 확인).
아래 2개 키워드는 **이미 이 프로젝트에 페이지가 있으므로 새로 만들지 말 것**:

| 키워드 | 기존 new-biz slug | 확인 사항만 하면 됨 |
|---|---|---|
| 모바일신분증발급 | `mobile-id-issue` | 키워드 리터럴 포함 여부만 재확인(이미 포함됨 확인함) |
| 육아휴직급여신청 | `parental-leave-pay` | 키워드 리터럴 포함 여부만 재확인(이미 포함됨 확인함) |

또한 `car-tax-annual`(자동차세 연납 신청·할인율)이 이미 있으나, 이번 Tier1의
자동차세 관련 키워드(자동차세납부·자동차세환급·자동차세납부조회)는
**연납이 아니라 납부 시기 조회·환급**이라는 다른 검색 의도라 겹치지 않는다.
다만 새 글을 쓸 때 `car-tax-annual`과 내용이 겹치지 않는지, 오히려 서로
내부링크로 연결할 가치가 있는지 판단할 것(§4의 내부링크 원칙 참고).

---

## 3. 포팅 대상 15개 키워드 → 실제로 만들 페이지 수

biz.zucca100.com에서는 성격이 비슷한 항목을 2~5개씩 묶어 pillar 페이지로
만들었지만, **new-biz의 기존 패턴은 실업급여 키워드 하나하나를 별도 페이지로
쪼개는 방식**(`unemployment-benefit-application`, `-eligibility`,
`-calculator-guide`, `-recognition-rounds`, `-payment-info` 5편)이었다.
이번 사용자 세션에서도 "각각 넘버링되는 항목은 개별 페이지로 분리해달라"는
요청을 받았으므로, **new-biz에서도 기본적으로 1키워드(또는 강하게 묶이는
2~3개)=1페이지 원칙을 따르는 것을 권장**한다. 다만 최종 판단은 이 프로젝트를
이어받는 세션 또는 사용자와 다시 확인할 것 — 이 문서는 강제 지침이 아니라 권장안이다.

권장 페이지 구성(15개 키워드 → 8페이지):

| 새 페이지(가칭 slug) | 커버 키워드 | 참고할 biz 원문 slug | CTA 목적지(zucca100.com, 200 확인됨) |
|---|---|---|---|
| `resident-registration-move-report-guide` | 전입신고 | gov24-online-document-issuance-guide (②) | `https://zucca100.com/전입신고-하는법-인터넷-필요서류-세대주-확인-준비물-확정일자-기간/` |
| `resident-certificate-online-issue-guide` | 주민등록등본인터넷발급 | gov24-online-document-issuance-guide (③) | `https://zucca100.com/주민등록등본-인터넷발급-주민등록등본-pdf-다운로드/` |
| `seal-certificate-online-guide` | 인감증명서 | gov24-online-document-issuance-guide (④) | `https://zucca100.com/인감증명서-온라인-발급-바로가기/` |
| `mobile-health-insurance-card-guide` | 모바일건강보험증발급 | gov24-online-document-issuance-guide (⑤) | `https://zucca100.com/모바일-건강보험증-발급-및-다운로드/` |
| `k-pass-refund-guide` | K패스환급 | car-tax-refund-check-guide (①) | `https://zucca100.com/k-pass-return/` |
| `car-tax-payment-refund-check-guide` | 자동차세납부·자동차세환급·자동차세납부조회 | car-tax-refund-check-guide (②③) | 납부·조회: `https://zucca100.com/car-tax/` / 환급: `https://zucca100.com/car-tax-return/` |
| `telecom-bill-refund-check-guide` | 통신비환급금·통신비환급·환급액조회 | car-tax-refund-check-guide (④⑤) | 통합조회: `https://zucca100.com/not-return-tax/` / 스마트초이스: `https://zucca100.com/27-2/` |
| `weekly-paid-holiday-allowance-guide` | 주휴수당계산기 | weekly-paid-holiday-allowance-guide | `https://plus.zucca100.com/holiday-pay-calculator` |
| `happy-housing-application-guide` | 행복주택신청 | happy-housing-application-guide | `https://zucca100.com/myhome-portal/` |
| `child-tax-credit-application-guide-2026` | 자녀장려금신청 | child-tax-credit-application-guide-2026 | `https://zucca100.com/2026-자녀장려금-신청-기준-재산-조회-지급일-조건/` (percent-encoded, 원문 posts.json에서 그대로 복사) |
| `old-age-pension-application-guide` | 노령연금신청 | old-age-pension-application-guide | `https://zucca100.com/old-age-pension/` |

CTA 목적지 URL은 이미 200 확인된 것들이지만, **실제 등록 직전에 다시
`curl -s -o /dev/null -w "%{http_code}\n" "URL"`로 재확인**할 것(시간이 지나 원문이
내려갔을 수 있음). 자동차세·통신비 두 그룹은 키워드가 여러 개라 묶어서 하나의
페이지로 만들지, 개별로 쪼갤지는 최종 재량으로 판단.

---

## 4. 반드시 지킬 것 (biz.zucca100.com 작업에서 얻은 교훈)

1. **문장을 그대로 베끼지 않는다.** biz.zucca100.com 원문은 구조(어떤 항목을
   어떤 순서로, 어떤 CTA와 함께 다루는지)만 참고하고, 실제 문장은 새로
   쓴다. 특히 도입부·FAQ는 표현을 다르게 가져갈 것.
2. **내부링크(`<a href="/posts/...">`)는 biz 쪽 것을 그대로 복사하면 안 된다.**
   biz.zucca100.com에서 `k-pass`, `senior-pension-early-vs-deferred`,
   `unemployment-benefit-application` 같은 slug로 걸었던 내부링크는
   new-biz에 **존재하지 않는 페이지**라 그대로 가져오면 깨진 링크가 된다.
   new-biz 자체 15개 글(예: `unemployment-benefit-*` 5편, `car-tax-annual`)
   중에서 진짜로 내용이 통하는 것이 있을 때만 새로 연결하고, 없으면 억지로
   만들지 말 것 — 이건 이전 세션에서 사용자가 명시적으로 지적한 원칙이다
   ("내용과 어울리는 내부링크버튼을 붙여야 할 것 같아... 억지로 추가할
   필요가 없어, 연관된 내용 없으면 생략해도 좋아").
3. **주의: new-biz에는 아직 `InternalLinkQueryPreserver`가 없다.** (2026-07-23 기준
   `grep -r InternalLinkQueryPreserver .` 결과 0건으로 직접 확인함.) biz.zucca100.com에서는
   이 컴포넌트가 유료 유입 시 본문의 `<a href="/posts/...">` 링크에 쿼리스트링을
   자동으로 이어붙여, 내부링크를 타고 이동해도 다음 페이지의 CTA/광고가 계속
   노출되게 해준다. new-biz에 이 컴포넌트가 없는 상태로 내부링크를 걸면, 유료
   유입 사용자가 내부링크를 클릭해 다음 페이지로 이동하는 순간 쿼리스트링이
   사라져 그 페이지는 "다이렉트 접속"으로 재판정되고 CTA/광고가 숨는다.
   따라서 **내부링크를 쓰기 전에 먼저 `components/cta/internal-link-query-preserver.tsx`를
   biz.zucca100.com에서 그대로 복사해 오고, `app/posts/[slug]/page.tsx`에
   동일하게 마운트**해야 한다(참고: `nextjs-wordpress-headless-cms/app/posts/[slug]/page.tsx`의
   `<InternalLinkQueryPreserver containerId={...} />` 부분). 이 작업 전에는
   내부링크를 아예 걸지 않는 편이 안전하다.
4. **CTA는 `contentHtml` 안에 `<!--CTA:n-->` 마커 + `cta[]` 배열**로 작성(`docs/content-page-playbook.md`
   §3 참고). `target="_blank"` 금지.
5. **키워드는 리터럴 문자열로 반드시 포함**시키고(예: "자동차세납부"), 전수
   커버리지를 node 스크립트로 검증한다(아래 §6 스니펫 참고).
6. **slug는 new-biz 기존 15개와 충돌 없는지 확인**(`node -e "..."`로 grep).
7. **카테고리는 new-biz가 이미 쓰는 것 재사용**: `생활정보`, `정부지원/정책`,
   `통신/IT`, `취업`, `여행/나들이`. 새 카테고리를 임의로 만들지 않는다.
8. **작성 순서는 `docs/content-page-playbook.md` §5·§9를 그대로 따른다**
   (원문 200 확인 → slug 중복 확인 → 본문 작성 → 키워드 커버리지 검증 →
   JSON/tsc/build 검증 → git 커밋/푸시는 **사용자 확답 후에만**).

---

## 5. 광고 소재(파워링크 제목/설명)도 필요하면

biz.zucca100.com 작업 때 `skills/Naver_Ad_Keyword_And_Copy_Strategy.md`와
`skills/AI_Copywriting_Skill_Guideline.md`를 참고해 키워드 표 + 광고 소재를
만들었다. **new-biz 프로젝트에는 현재 `skills/` 폴더가 없다** — 필요하면
`C:\Users\devzu\Documents\nextjs-wordpress-headless-cms\skills\`의 두 파일을
복사해 오거나, 같은 로직을 그대로 적용하면 된다(표시 URL만
`https://new-biz.zucca100.com/posts/{slug}`로 바꿀 것).

---

## 6. 검증 스니펫 (그대로 복붙해서 사용)

```bash
# JSON 유효성 + slug 중복 확인
node -e "
const fs=require('fs');
const arr = JSON.parse(fs.readFileSync('content/posts.json','utf8'));
console.log('total:', arr.length);
console.log('dup slugs:', arr.map(p=>p.slug).filter((s,i,a)=>a.indexOf(s)!==i));
"

# 키워드 리터럴 커버리지 (slug -> [키워드,...] 맵을 채워서 사용)
node -e "
const fs=require('fs');
const arr = JSON.parse(fs.readFileSync('content/posts.json','utf8'));
const map = { 'SLUG': ['키워드1','키워드2'] };
for (const [slug, kws] of Object.entries(map)) {
  const p = arr.find(x=>x.slug===slug);
  for (const kw of kws) console.log(slug, kw, p ? p.contentHtml.includes(kw) : 'POST NOT FOUND');
}
"

# 내부링크 무결성(끊어진 /posts/ 링크 없는지)
node -e "
const fs=require('fs');
const arr = JSON.parse(fs.readFileSync('content/posts.json','utf8'));
const slugSet = new Set(arr.map(p=>p.slug));
for (const p of arr) {
  const links = [...(p.contentHtml||'').matchAll(/href=\"\/posts\/([^\"]+)\"/g)].map(m=>m[1]);
  for (const t of links) if (!slugSet.has(t)) console.log('BROKEN', p.slug, '->', t);
}
"

# target=_blank 금지 확인
node -e "
const fs=require('fs');
const arr = JSON.parse(fs.readFileSync('content/posts.json','utf8'));
console.log((JSON.stringify(arr).match(/target=.?_blank/g)||[]).length);
"

npx tsc --noEmit -p tsconfig.json
pnpm build
```

---

## 7. 다음 세션 작업 순서 제안

1. 이 문서와 `docs/content-page-playbook.md`, `docs/new-biz-approval-notes.md`를 먼저 읽는다.
2. §2의 중복 항목(모바일신분증발급/육아휴직급여신청)은 건드리지 않는다.
3. §3 표의 8개 페이지를 우선순위(월검색량 높은 것부터: 통신/자동차세 그룹,
   K패스환급, 전입신고, 등본, 인감증명서, 건강보험증, 행복주택, 자녀장려금,
   노령연금, 주휴수당) 순으로 하나씩 작성한다.
4. 매 페이지마다 §4의 8가지 원칙 + §6 검증 스니펫을 적용한다.
5. 전부 완료 후 `git status`/`fetch`로 원격 동기화 확인 → 사용자에게 커밋/푸시
   여부를 확인받는다(마음대로 push하지 않는다).
