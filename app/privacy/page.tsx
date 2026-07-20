import { Section, Container, Prose } from "@/components/craft";
import { siteConfig } from "@/site.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${siteConfig.site_name}의 개인정보 수집·이용에 관한 방침입니다.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <Section>
      <Container className="max-w-2xl">
        <Prose>
          <h1>개인정보처리방침</h1>
          <p className="text-sm text-muted-foreground">
            시행일: 2026년 7월 20일
          </p>
          <p>
            {siteConfig.site_name}(이하 &lsquo;사이트&rsquo;)은 이용자의
            개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을
            준수합니다. 본 방침은 사이트가 어떤 정보를 수집하고 어떻게 이용하는지
            안내합니다.
          </p>

          <h2>1. 수집하는 정보</h2>
          <p>
            본 사이트는 회원가입 절차가 없으며, 이름·연락처 등 개인을 직접
            식별하는 정보를 직접 수집하지 않습니다. 다만 서비스 운영·통계·광고를
            위해 다음 정보가 자동으로 수집될 수 있습니다.
          </p>
          <ul>
            <li>접속 로그, 방문 일시, 브라우저·기기 정보, 쿠키</li>
            <li>유입 경로(검색어·광고 파라미터 등) 및 페이지 이용 기록</li>
          </ul>

          <h2>2. 이용 목적</h2>
          <ul>
            <li>콘텐츠 이용 통계 분석 및 서비스 개선</li>
            <li>맞춤형 광고 제공 및 광고 성과 측정</li>
          </ul>

          <h2>3. 쿠키 및 제3자 서비스</h2>
          <p>
            본 사이트는 방문 분석을 위해 Google Analytics를, 광고 게재를 위해
            Google AdSense 등 제3자 서비스를 이용합니다. 이 과정에서 쿠키 및
            유사 기술이 사용될 수 있습니다. 이용자는 브라우저 설정에서 쿠키
            저장을 거부하거나 삭제할 수 있으며, 이 경우 일부 기능 이용에 제한이
            있을 수 있습니다.
          </p>
          <ul>
            <li>
              Google 광고 설정:{" "}
              <a
                href="https://www.google.com/settings/ads"
                rel="noopener noreferrer"
              >
                google.com/settings/ads
              </a>
            </li>
          </ul>

          <h2>4. 보유 및 이용 기간</h2>
          <p>
            자동 수집된 정보는 수집 목적 달성에 필요한 기간 동안 보유하며,
            관련 법령에 특별한 규정이 있는 경우 그 기간에 따릅니다.
          </p>

          <h2>5. 이용자의 권리</h2>
          <p>
            이용자는 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요청할 수
            있으며, 요청은 아래 연락처로 접수할 수 있습니다.
          </p>

          <h2>6. 개인정보 보호책임자</h2>
          <p>
            개인정보 보호책임자: 김영주
            <br />
            이메일:{" "}
            <a href="mailto:devzucca@gmail.com">devzucca@gmail.com</a>
          </p>

          <h2>7. 방침의 변경</h2>
          <p>
            본 방침은 법령·서비스 변경에 따라 개정될 수 있으며, 개정 시 본
            페이지를 통해 시행일과 함께 공지합니다.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
