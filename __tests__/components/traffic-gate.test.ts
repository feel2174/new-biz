import { describe, it, expect } from "vitest";
import { detectPaidTraffic } from "@/components/traffic/traffic-gate";

function params(qs: string) {
  return new URLSearchParams(qs);
}

describe("detectPaidTraffic", () => {
  it("returns false for direct access (no params, no referrer)", () => {
    expect(detectPaidTraffic(params(""), "")).toBe(false);
  });

  it("returns false for organic search referrer without ad params", () => {
    expect(detectPaidTraffic(params(""), "https://www.google.com/")).toBe(
      false
    );
    expect(
      detectPaidTraffic(params(""), "https://search.naver.com/search.naver")
    ).toBe(false);
  });

  it("detects Naver powerlink params", () => {
    expect(detectPaidTraffic(params("n_media=27758"), "")).toBe(true);
    expect(detectPaidTraffic(params("n_ad_group=grp&n_keyword=kw"), "")).toBe(
      true
    );
    expect(detectPaidTraffic(params("n_campaign_type=1"), "")).toBe(true);
  });

  it("detects utm naver powerlink/cpc", () => {
    expect(
      detectPaidTraffic(params("utm_source=naver&utm_medium=powerlink"), "")
    ).toBe(true);
    expect(
      detectPaidTraffic(params("utm_source=naver&utm_medium=cpc"), "")
    ).toBe(true);
  });

  it("does not detect Naver NaPm without explicit paid signals", () => {
    expect(detectPaidTraffic(params("NaPm=ct%3Dabc%7Ctr%3Dsa"), "")).toBe(false);
    expect(detectPaidTraffic(params("NaPm=anything"), "")).toBe(false);
  });

  it("does not detect Kakao/Daum paid signals", () => {
    expect(detectPaidTraffic(params("kakao_ad=1"), "")).toBe(false);
    expect(
      detectPaidTraffic(params("utm_source=kakao&utm_medium=cpc"), "")
    ).toBe(false);
    expect(
      detectPaidTraffic(params("utm_medium=keyword"), "")
    ).toBe(false);
    expect(
      detectPaidTraffic(params(""), "https://ad.daum.net/clk")
    ).toBe(false);
  });

  it("detects Naver partner URLs only when n_* params are present", () => {
    expect(
      detectPaidTraffic(
        params(
          "NaPm=ct%3Dmr0a4gjx%7Cci%3DERd624e7f6%2D744e%2D11f1%2Db915%2D56305bda6a30%7Ctr%3Dsa"
        ),
        ""
      )
    ).toBe(false);
    expect(
      detectPaidTraffic(
        params(
          "l_idkey=1000000024&n_media=612593&n_query=foo&n_rank=2&n_campaign_type=1&NaPm=ct%3Dmr0a5ojm"
        ),
        ""
      )
    ).toBe(true);
  });

  it("does not flag organic kakao referral", () => {
    expect(
      detectPaidTraffic(params("utm_source=kakao&utm_medium=referral"), "")
    ).toBe(false);
    expect(detectPaidTraffic(params(""), "https://www.kakao.com/")).toBe(false);
  });

  it("does not flag naver organic utm (referral/blog)", () => {
    expect(
      detectPaidTraffic(params("utm_source=naver&utm_medium=referral"), "")
    ).toBe(false);
  });

  it("detects Google paid signals (gclid etc.)", () => {
    expect(detectPaidTraffic(params("gclid=abc123"), "")).toBe(true);
    expect(detectPaidTraffic(params("gad_source=1"), "")).toBe(true);
    expect(detectPaidTraffic(params("wbraid=xyz"), "")).toBe(true);
    expect(
      detectPaidTraffic(params("utm_source=google&utm_medium=cpc"), "")
    ).toBe(true);
  });

  it("does not detect generic paid mediums without source", () => {
    expect(detectPaidTraffic(params("utm_medium=cpc"), "")).toBe(false);
    expect(detectPaidTraffic(params("utm_medium=ppc"), "")).toBe(false);
  });

  it("does not detect ad-network referrers without query params", () => {
    expect(
      detectPaidTraffic(params(""), "https://ad.search.naver.com/abc")
    ).toBe(false);
    expect(
      detectPaidTraffic(params(""), "https://www.googleadservices.com/pagead")
    ).toBe(false);
  });
});
