import { Section, Container, Prose } from "@/components/craft";
import { siteConfig } from "@/site.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${siteConfig.site_name} 서비스 이용약관입니다.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <Section>
      <Container className="max-w-2xl">
        <Prose>
          <h1>이용약관</h1>
          <p className="text-sm text-muted-foreground">
            시행일: 2026년 7월 20일
          </p>

          <h2>제1조 (목적)</h2>
          <p>
            본 약관은 {siteConfig.site_name}(이하 &lsquo;사이트&rsquo;)이 제공하는
            정보 콘텐츠의 이용 조건과 절차, 이용자와 사이트의 권리·의무를 규정하는
            것을 목적으로 합니다.
          </p>

          <h2>제2조 (콘텐츠의 성격)</h2>
          <p>
            사이트가 제공하는 모든 콘텐츠는 일반적인 정보 제공을 목적으로 합니다.
            각 제도·서비스의 신청 자격, 금액, 기간 등은 정책 변경에 따라 달라질 수
            있으므로, 이용자는 최종 결정 전 반드시 해당 공식 기관에서 최신 내용을
            확인해야 합니다.
          </p>

          <h2>제3조 (책임의 한계)</h2>
          <p>
            사이트는 콘텐츠의 정확성과 최신성을 위해 노력하지만, 정보를 근거로 한
            이용자의 판단·행위 및 그 결과에 대해서는 법령이 허용하는 범위에서
            책임을 지지 않습니다. 공식 기관·서비스 제공자의 안내가 본 사이트의
            내용과 다를 경우 공식 안내가 우선합니다.
          </p>

          <h2>제4조 (외부 링크)</h2>
          <p>
            사이트에는 외부 사이트로 연결되는 링크가 포함될 수 있으며, 링크된
            외부 사이트의 콘텐츠·정책에 대해서는 해당 사이트가 책임을 집니다.
          </p>

          <h2>제5조 (저작권)</h2>
          <p>
            사이트에 게시된 콘텐츠의 저작권은 사이트 또는 정당한 권리자에게
            있으며, 무단 복제·배포를 금합니다.
          </p>

          <h2>제6조 (약관의 변경)</h2>
          <p>
            본 약관은 관련 법령을 위배하지 않는 범위에서 개정될 수 있으며, 개정
            시 본 페이지에 시행일과 함께 공지합니다.
          </p>

          <h2>제7조 (문의)</h2>
          <p>
            약관 관련 문의:{" "}
            <a href="mailto:devzucca@gmail.com">devzucca@gmail.com</a>
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
