import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type PostListItem = {
  href: string;
  title: string;
  excerpt: string;
  date: string;
  category?: string;
  image?: string;
};

export function PostListCard({ post }: { post: PostListItem }) {
  const date = new Date(post.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={post.href}
      className={cn(
        "border p-4 bg-accent/30 rounded-lg group flex justify-between flex-col not-prose gap-8",
        "hover:bg-accent/75 transition-all"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="h-48 w-full overflow-hidden relative rounded-md border flex items-center justify-center bg-muted">
          {post.image ? (
            post.image.startsWith("/") ? (
              // 로컬 정적 이미지(SVG 등)는 최적화 없이 그대로 렌더
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="h-full w-full object-cover"
                src={post.image}
                alt={post.title}
              />
            ) : (
              <Image
                className="h-full w-full object-cover"
                src={post.image}
                alt={post.title}
                width={400}
                height={200}
              />
            )
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
              이미지 없음
            </div>
          )}
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: post.title || "제목 없음" }}
          className="text-xl text-primary font-medium group-hover:underline decoration-muted-foreground underline-offset-4 decoration-dotted transition-all"
        ></div>
        <div className="text-sm text-muted-foreground">
          {post.excerpt || "요약 정보가 없습니다."}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <hr />
        <div className="flex justify-between items-center text-xs">
          <p>{post.category || "미분류"}</p>
          <p>{date}</p>
        </div>
      </div>
    </Link>
  );
}
