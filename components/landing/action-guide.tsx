import { CtaLink } from "@/components/cta/cta-link";
import { GatedActionLink } from "@/components/cta/gated-action-link";
import { PaidOnly } from "@/components/traffic/traffic-gate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActionGuide, LocalCta } from "@/lib/local-posts";

type ActionGuideProps = {
  guide: ActionGuide;
  cta?: LocalCta[];
  slug: string;
};

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function ActionGuideLanding({ guide, cta, slug }: ActionGuideProps) {
  const taskMenuItems = guide.tasks.filter((task) => task.href);

  return (
    <div className="space-y-10 not-prose">
      <div className="rounded-lg border bg-accent/25 p-5">
        <p className="text-sm font-medium text-muted-foreground">
          {guide.intent}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {guide.summary.map((item) => (
            <div key={item} className="rounded-md bg-background p-3 text-sm">
              {item}
            </div>
          ))}
        </div>
      </div>

      {guide.quickLinks && guide.quickLinks.length > 0 && (
        <PaidOnly>
          <section className="space-y-4">
            <SectionTitle
              title="필요한 경로 먼저 확인하기"
              description="광고 유입에서는 기기별 설치 경로와 확인 메뉴를 바로 열 수 있습니다."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {guide.quickLinks.map((link, index) => (
                <GatedActionLink
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  label={link.label}
                  description={link.description}
                  buttonName={`${slug}-quick-link-${index}`}
                />
              ))}
            </div>
          </section>
        </PaidOnly>
      )}

      {taskMenuItems.length > 0 && (
        <PaidOnly>
          <section className="space-y-4">
            <SectionTitle title="목적별 이용 메뉴" />
            <div className="flex flex-wrap gap-2">
              {taskMenuItems.map((task) => (
                <Button key={task.title} asChild variant="outline" size="sm">
                  <a href={`#${task.id}`}>{task.title}</a>
                </Button>
              ))}
            </div>
          </section>
        </PaidOnly>
      )}

      <section className="space-y-6">
        <SectionTitle
          title="목적별 이용 방법"
          description={`${guide.primaryKeyword}를 찾는 방문자가 실제로 하려는 작업을 기준으로 정리했습니다.`}
        />
        <div className="space-y-5">
          {guide.tasks.map((task, index) => (
            <article
              key={task.id}
              id={task.id}
              className="scroll-mt-24 rounded-lg border p-5"
            >
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="min-w-0 space-y-3">
                  <h3 className="text-lg font-medium tracking-tight">
                    {task.title}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {task.description}
                  </p>
                  {task.steps && task.steps.length > 0 && (
                    <ol className="list-decimal space-y-2 pl-5 text-sm leading-6">
                      {task.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {task.keywords && task.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {task.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  {task.href && task.hrefLabel && (
                    <GatedActionLink
                      href={task.href}
                      label={task.hrefLabel}
                      description={task.hrefDescription}
                      buttonName={`${slug}-task-${task.id}`}
                    />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {cta && cta.length > 0 && (
        <section className="space-y-3">
          {cta.map((btn, index) => (
            <CtaLink
              key={`${btn.href}-${index}`}
              btn={btn}
              buttonName={`${slug}-action-guide-cta${index}`}
            />
          ))}
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {guide.checks && guide.checks.length > 0 && (
          <section className="space-y-4 rounded-lg border p-5">
            <SectionTitle title="이용 전 확인사항" />
            <ul className="space-y-2 text-sm leading-6">
              {guide.checks.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {guide.cautions && guide.cautions.length > 0 && (
          <section className="space-y-4 rounded-lg border p-5">
            <SectionTitle title="주의할 점" />
            <ul className="space-y-2 text-sm leading-6">
              {guide.cautions.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {guide.faq && guide.faq.length > 0 && (
        <section className="space-y-4">
          <SectionTitle title="자주 묻는 질문" />
          <div className="divide-y rounded-lg border">
            {guide.faq.map((item) => (
              <details key={item.question} className="group p-5">
                <summary className="cursor-pointer text-sm font-semibold">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {guide.relatedKeywords && guide.relatedKeywords.length > 0 && (
        <section className="space-y-4">
          <SectionTitle title="함께 찾는 검색어" />
          <div className="flex flex-wrap gap-2">
            {guide.relatedKeywords.map((keyword) => (
              <span
                key={keyword}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs text-muted-foreground",
                  keyword === guide.primaryKeyword && "border-primary text-foreground"
                )}
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      <p className="rounded-lg border bg-muted/40 p-4 text-xs leading-5 text-muted-foreground">
        {guide.disclaimer ||
          "본 페이지는 이용자가 필요한 경로와 절차를 찾기 쉽도록 정리한 정보성 안내 페이지이며, 해당 브랜드의 공식 사이트가 아닐 수 있습니다. 중요한 신청, 결제, 개인정보 입력 전에는 이동한 페이지의 공식 도메인과 운영 주체를 확인하세요."}
      </p>
    </div>
  );
}
