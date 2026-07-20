import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Google Fonts에서 주어진 텍스트에 필요한 글리프만 포함한 폰트(ttf)를 로드한다.
 * 한국어 OG 이미지의 두부(□) 현상을 방지하기 위함.
 */
async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("Failed to load Google font");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "주카 비즈";
    const description = searchParams.get("description") || "";

    // 렌더에 필요한 글리프(제목+설명)만 폰트로 로드
    const fontText = `${title}${description}주카 비즈`;
    const [bold, regular] = await Promise.all([
      loadGoogleFont("Noto+Sans+KR:wght@700", fontText),
      loadGoogleFont("Noto+Sans+KR:wght@400", fontText),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "80px",
            backgroundColor: "white",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)",
            backgroundSize: "100px 100px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontFamily: "Noto Sans KR",
              fontWeight: 700,
              color: "black",
              marginBottom: 30,
              whiteSpace: "pre-wrap",
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 30,
                fontFamily: "Noto Sans KR",
                fontWeight: 400,
                color: "gray",
                whiteSpace: "pre-wrap",
                lineHeight: 1.3,
                maxWidth: "900px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {description}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Noto Sans KR", data: bold, weight: 700, style: "normal" },
          {
            name: "Noto Sans KR",
            data: regular,
            weight: 400,
            style: "normal",
          },
        ],
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.log(`OG image error: ${message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
