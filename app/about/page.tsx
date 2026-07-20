import { Section, Container, Prose } from "@/components/craft";
import { siteConfig } from "@/site.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: `${siteConfig.site_name} 운영 목적과 편집 원칙, 운영자 정보를 안내합니다.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Section>
      <Container className="max-w-2xl">
        <Prose>
          <h1>{siteConfig.site_name} 소개</h1>
          <p className="text-lg text-muted-foreground">
            {siteConfig.site_name}은 정부지원금·생활행정·금융 서비스처럼 실생활에
            꼭 필요하지만 절차가 복잡한 정보를, 공식 자료를 바탕으로 쉽고 정확하게
            정리해 전달하는 정보 제공 블로그입니다.
          </p>

          <h2>무엇을 다루나요</h2>
          <ul>
            <li>
              <strong>정부지원·정책</strong> — 육아휴직급여, 청년 복지포인트 등
              신청 자격·금액·절차 안내
            </li>
            <li>
              <strong>생활행정</strong> — 운전면허증 재발급, 모바일 신분증,
              자동차세 납부 등 민원·행정 처리 방법
            </li>
            <li>
              <strong>취업·금융</strong> — 워크넷 구직등록, 각종 공공 서비스
              이용 방법
            </li>
          </ul>

          <h2>편집 원칙</h2>
          <ul>
            <li>
              정부24·홈택스·위택스·고용24 등 <strong>공식 출처를 우선</strong>
              확인하고, 금액·기간 등 수치는 발표 시점 기준으로 표기합니다.
            </li>
            <li>
              제도는 매년 바뀔 수 있으므로, 신청 전 반드시 해당{" "}
              <strong>공식 기관에서 최신 내용을 재확인</strong>하도록 안내합니다.
            </li>
            <li>
              특정 상품·서비스의 효과를 단정하거나 과장하지 않으며, 정보 제공을
              목적으로 합니다.
            </li>
          </ul>

          <h2>운영자 정보</h2>
          <p>
            운영자: 생활정보 나침반 편집팀
            <br />
            개인정보 보호책임자: 김영주
            <br />
            문의 이메일:{" "}
            <a href="mailto:devzucca@gmail.com">devzucca@gmail.com</a>
          </p>
          <p className="text-sm text-muted-foreground">
            본 사이트는 정보 제공을 목적으로 하며, 각 제도·서비스의 공식 운영
            주체와는 관련이 없습니다. 최종 신청·이용은 반드시 공식 채널을 통해
            진행하시기 바랍니다.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
