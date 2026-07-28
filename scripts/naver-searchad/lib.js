// 네이버 검색광고 API 최소 클라이언트 (인증 서명 + 채널/캠페인/광고그룹/소재 호출)
// 참고: https://github.com/naver/searchad-apidoc
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://api.searchad.naver.com";

// Next.js 없이 단독 실행되는 스크립트라 .env.local을 직접 읽어 process.env에 채워 넣는다.
// 이미 process.env에 있는 값(예: 셸에서 export한 값)은 덮어쓰지 않는다.
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvLocal();

const API_KEY = process.env.NAVER_SEARCHAD_API_KEY;
const SECRET_KEY = process.env.NAVER_SEARCHAD_SECRET_KEY;
const CUSTOMER_ID = process.env.NAVER_SEARCHAD_CUSTOMER_ID;

function assertCredentials() {
  const missing = [];
  if (!API_KEY) missing.push("NAVER_SEARCHAD_API_KEY");
  if (!SECRET_KEY) missing.push("NAVER_SEARCHAD_SECRET_KEY");
  if (!CUSTOMER_ID) missing.push("NAVER_SEARCHAD_CUSTOMER_ID");
  if (missing.length > 0) {
    throw new Error(
      ".env.local에 다음 값이 없습니다: " +
        missing.join(", ") +
        "\nmanage.searchad.naver.com > 도구 > API 관리자에서 발급받아 채워주세요."
    );
  }
}

function generateSignature(timestamp, method, uri) {
  const message = `${timestamp}.${method}.${uri}`;
  return crypto.createHmac("sha256", SECRET_KEY).update(message).digest("base64");
}

function getHeaders(method, uri) {
  const timestamp = Date.now().toString();
  return {
    "Content-Type": "application/json; charset=UTF-8",
    "X-Timestamp": timestamp,
    "X-API-KEY": API_KEY,
    "X-Customer": String(CUSTOMER_ID),
    "X-Signature": generateSignature(timestamp, method, uri),
  };
}

async function apiRequest(method, uri, body) {
  assertCredentials();
  const headers = getHeaders(method, uri);
  const res = await fetch(BASE_URL + uri, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const err = new Error(
      `네이버 검색광고 API 오류 ${res.status} (${method} ${uri}): ${JSON.stringify(json)}`
    );
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

// ---- 리소스별 호출 ----

function listChannels() {
  return apiRequest("GET", "/ncc/channels");
}

function createCampaign({ name, dailyBudget }) {
  const body = {
    name,
    campaignTp: "WEB_SITE", // 파워링크(검색 텍스트 광고) 캠페인 유형
  };
  if (dailyBudget) {
    body.dailyBudget = dailyBudget;
    body.useDailyBudget = true;
  }
  return apiRequest("POST", "/ncc/campaigns", body);
}

function createAdgroup({ campaignId, name, businessChannelId }) {
  const body = {
    nccCampaignId: campaignId,
    name,
    nccBusinessChannelId: businessChannelId,
  };
  return apiRequest("POST", "/ncc/adgroups", body);
}

function createAd({ adgroupId, headline, description, pcUrl, mobileUrl }) {
  const body = {
    nccAdgroupId: adgroupId,
    type: "TEXT_45",
    ad: {
      headline,
      description,
      pc: { final: pcUrl },
      mobile: { final: mobileUrl },
    },
  };
  return apiRequest("POST", "/ncc/ads", body);
}

module.exports = {
  BASE_URL,
  assertCredentials,
  apiRequest,
  listChannels,
  createCampaign,
  createAdgroup,
  createAd,
};
