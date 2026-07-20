import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function NotFound() {
  return (
    <Section>
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h1 className="text-4xl font-bold mb-4">404 - 페이지를 찾을 수 없습니다</h1>
          <p className="mb-8 text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
          <Button asChild className="not-prose mt-6">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
