import { Section, Container } from "@/components/craft";
import { PaidOnly } from "@/components/traffic/traffic-gate";
import { mainMenu, contentMenu } from "@/menu.config";
import { siteConfig } from "@/site.config";
import Logo from "@/public/logo.svg";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <Section>
        <Container className="grid md:grid-cols-[1.5fr_0.5fr_0.5fr] gap-12">
          <div className="flex flex-col gap-6 not-prose">
            <Link href="/">
              <h3 className="sr-only">{siteConfig.site_name}</h3>
              <Image
                src={Logo}
                alt={siteConfig.site_name}
                className="dark:invert"
                width={42}
                height={26.44}
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-prose">
              {siteConfig.site_description}
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>운영자: 생활정보 나침반 편집팀</p>
              <p>개인정보 보호책임자: 김영주</p>
              <p>
                이메일:{" "}
                <a
                  className="hover:underline underline-offset-4"
                  href="mailto:devzucca@gmail.com"
                >
                  devzucca@gmail.com
                </a>
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                className="hover:underline underline-offset-4"
                href="/about"
              >
                소개
              </Link>
              <Link
                className="hover:underline underline-offset-4"
                href="/privacy"
              >
                개인정보처리방침
              </Link>
              <Link
                className="hover:underline underline-offset-4"
                href="/terms"
              >
                이용약관
              </Link>
              <Link
                className="hover:underline underline-offset-4"
                href="/contact"
              >
                문의하기
              </Link>
            </div>
          </div>

          {/* 하단 메뉴 — 유료 광고 유입에서만 노출 */}
          <PaidOnly>
            <div className="flex flex-col gap-2 text-sm">
              <h5 className="font-medium text-base">바로가기</h5>
              {mainMenu.map((item) => (
                <Link
                  className="hover:underline underline-offset-4"
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </PaidOnly>
          <PaidOnly>
            <div className="flex flex-col gap-2 text-sm">
              <h5 className="font-medium text-base">블로그</h5>
              {contentMenu.map((item) => (
                <Link
                  className="hover:underline underline-offset-4"
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </PaidOnly>
        </Container>
        <Container className="border-t not-prose pt-6 space-y-4">
          <div className="text-xs text-muted-foreground/80 leading-relaxed bg-muted/40 p-4 rounded-lg border border-border/50">
            <p className="font-semibold text-foreground/80 mb-1">
              [면책 공고 및 비즈니스 관계 안내]
            </p>
            <p>
              본 웹사이트(생활정보 나침반)는 한국도로공사, 고용노동부, 근로복지공단 등 정부·공공기관 및 특정 공식 브랜드와 법적·재정적 제휴 관계가 없는 독립된 민간 생활·행정 정보 안내 블로그입니다.
              제공되는 모든 콘텐츠는 대중의 편의를 돕기 위한 공공 정보 요약 및 단순 안내 목적으로 작성되었으며, 공식적인 행정 처리나 민원 신청은 각 기관의 공식 웹사이트를 이용해 주시기 바랍니다.
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-2 gap-4 justify-between md:items-center text-muted-foreground text-xs">
            <p>
              &copy; {new Date().getFullYear()} {siteConfig.site_name}. All rights reserved.
            </p>
            <p>
              독립 정보 서비스 · 공공기관 및 브랜드 사칭 금지 준수
            </p>
          </div>
        </Container>
      </Section>
    </footer>
  );
}
