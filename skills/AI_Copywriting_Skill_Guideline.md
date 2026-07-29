# AI Copywriting Skill Guideline for Website Content

**Document Version:** 1.0
**Target Audience:** AI Models, Content Generators, Development Scripts
**Primary Objective:** To generate highly engaging, intuitive, and conversion-optimized titles and content during website development by leveraging human psychology and proven copywriting formulas.

---

## 🛠 Core Directives
1. **NO ABSTRACT EXPRESSIONS:** Strictly avoid vague, broad, or overly generalized statements. 
2. **INTUITIVENESS:** Headlines must instantly register in the reader's mind.
3. **RULE SELECTION:** Apply at least one (or a combination) of the 6 frameworks below when generating headers, titles, or marketing copy.

---

## 📚 The 6 Copywriting Frameworks

### 1. RULE_CONTRADICTION (의외성 / 통념 부수기)
* **Logic:** Identify a common sense belief or stereotype related to the subject, then contradict it.
* **Psychology:** People are drawn to things that defy their standard expectations.
* **Formula:** `[Common Belief/Attribute] + [Negative Outcome / Reason it's wrong]`
* **Examples (Training Data):**
  - 유명하다는 이유만으로 하지 마세요 (Famous != Always good)
  - 경력이 오래됐다고 실력있는 게 아닌 이유 (Long experience != High skill)
  - 비싸다고 좋은 게 아닌 이유 (Expensive != Good)
  - 무식한 부자 (Rich != Smart)
  - 20대 여성의 붕어빵 장사 (Bungeoppang seller != Middle-aged)

### 2. RULE_CONCRETE_NUMBERS (구체성 / 숫자 활용)
* **Logic:** Use specific metrics, percentages, or step counts to make the abstract concrete.
* **Psychology:** Numbers stand out visually and provide a clear expectation of the content's scope and value.
* **Formula:** `[Specific Number (Time/Money/People/Steps)] + [Desired Outcome / Topic]`
* **Examples (Training Data):**
  - 10명 중 9명이 놓치는 OOO
  - 사업자 100명의 매출을 2배로 높여준 노하우 공개
  - 2달 만에 10kg 감량하는 법
  - 양아치 업체 거르는 방법 3가지
  - PT 10회만에 거북목 개선한 사례 공개

### 3. RULE_PROVOCATION (자존심 자극 / 약올리기 기법)
* **Logic:** Target the specific fears, undesirable states, or the exact opposite of what the customer wants to achieve. 
* **Psychology:** Triggering mild anxiety or challenging pride forces the user to verify if they fall into the "failure" category.
* **Variables to define before generation:** 
  1. `FEARED_OUTCOME`: What the customer hates the most.
  2. `DESIRED_OUTCOME`: What the customer wants to become.
* **Examples (Training Data):**
  - 실패한 사람들의 공통점 3가지
  - 얼굴 처지기 시작하는 여자들 특징
  - 설마.. 아직도 호구 잡히고 계세요?
  - 저렴한 업체만 찾다가 돈 날리는 OO 특징

### 4. RULE_LOSS_AVERSION (손실 회피 심리)
* **Logic:** Highlight potential losses, regrets, or damages rather than benefits.
* **Psychology:** Humans react more sensitively to losing something (money, health, time) than gaining something of equal value.
* **Formula:** `[Action/Mistake] + [Severe Loss / Regret / Damage]`
* **Examples (Training Data):**
  - PT 받고 허리 아작나는 이유
  - 2025년 절대 하면 안되는 프랜차이즈 3가지
  - 이런 곳은 선택하지 마세요 (업계 대표 양심고백)
  - 광고에 속아 후회하지 마세요
  - 잘못된 선택으로 1000만원 손해볼 수 있다?

### 5. RULE_AUTHORITY (권위자 인용 / 가치 입증)
* **Logic:** Prepend the statement with elements that prove expertise, experience, or authority.
* **Psychology:** Unfamiliar voices are not trusted. Authority borrows trust to validate the claim.
* **Formula:** `[Authority Figure / Years of Exp. / Success Rate] + [Action / Secret / Claim]`
* **Examples (Training Data):**
  - 여배우들이 오는 경락샵은 뭐가 다를까?
  - 15년 경력 트레이너가 알려주는-
  - 승소율 95% 변호사가 말하는-
  - 18년 경력 전문가가 말하는 OOO의 진실
  - 29년차 전문가가 꼭 지키는 체크리스트

### 6. RULE_CURIOSITY_GAP (정보 제한 / 궁금증 유발)
* **Logic:** Withhold a crucial piece of information using blanks ('OOO'), pronouns ('이것'), or vague pointers.
* **Psychology:** Creating a "curiosity gap" compels the user to click to resolve the psychological tension of not knowing.
* **Formula:** `[Action / Consequence] + [Missing Information Placeholder (이것/OO)]`
* **Examples (Training Data):**
  - ‘이것’ 모르면 무조건 뺏긴다?
  - 브랜드에서 콘텐츠보다 중요한 OOO
  - 의외로 ‘이것’을 몰라 후회합니다.
  - 대한민국 국민 80%가 ‘이 3가지’를 모르고 있다?
  - OO을 놓치면 무조건 손해볼 수밖에 없는 이유

---

## 💻 Output Generation Prompt Template (For AI Agents)
When requested to write titles or marketing content, use the following internal prompt logic:

```json
{
  "instruction": "Generate 5 headline options for the given product/service.",
  "rules_to_apply": ["RULE_LOSS_AVERSION", "RULE_CONCRETE_NUMBERS"],
  "product_topic": "{User's Topic}",
  "constraints": "Ensure the tone is intuitive. Do not use flowery or abstract adjectives. Follow the exact structures in the Skill Guideline."
}
```
