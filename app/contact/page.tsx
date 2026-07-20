import { Section, Container, Prose } from "@/components/craft";
import { siteConfig } from "@/site.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의하기",
  description: `${siteConfig.site_name}에 대한 문의·정정 요청 안내입니다.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Section>
      <Container className="max-w-2xl">
        <Prose>
          <h1>문의하기</h1>
          <p>
            콘텐츠 관련 문의, 오류·정정 요청, 제휴 문의는 아래 이메일로 보내
            주시면 확인 후 회신드립니다.
          </p>
          <h2>이메일 문의</h2>
          <p>
            <a href="mailto:devzucca@gmail.com">devzucca@gmail.com</a>
          </p>
          <h2>정정 요청 안내</h2>
          <p>
            게시된 정보 중 사실과 다른 내용이나 오래된 수치가 있다면, 해당 글
            제목과 함께 알려 주세요. 공식 출처를 재확인한 뒤 신속히 수정하겠습니다.
          </p>
          <p className="text-sm text-muted-foreground">
            일반적으로 영업일 기준 2~3일 이내에 답변드립니다.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
