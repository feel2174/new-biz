#!/usr/bin/env node
// 네이버 검색광고: 캠페인 생성 -> 광고그룹 생성 -> 소재(텍스트 광고) 등록을 한 번에 실행.
// 키워드 등록은 범위에 포함하지 않음(의도적) - 등록 후 관리시스템에서 직접 추가할 것.
//
// 사용법:
//   node scripts/naver-searchad/create-campaign.js \
//     --name "캠페인 이름" \
//     --adgroup "광고그룹 이름" \
//     --headline "제목(15자 내외)" \
//     --description "설명 문구" \
//     --pc-url "https://biz.zucca100.com/posts/slug" \
//     [--mobile-url "..."] [--channel "zucca100"] [--daily-budget 10000] \
//     [--execute]
//
// --execute를 주지 않으면 실제로 API를 호출하지 않고(채널 조회 제외) 무엇을 만들지만 보여준다(dry-run).

const { listChannels, createCampaign, createAdgroup, createAd } = require("./lib");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "execute") {
      args.execute = true;
      continue;
    }
    const value = argv[i + 1];
    args[key] = value;
    i++;
  }
  return args;
}

function printUsageAndExit() {
  console.log(
    [
      "사용법:",
      "  node scripts/naver-searchad/create-campaign.js \\",
      '    --name "캠페인 이름" \\',
      '    --adgroup "광고그룹 이름" \\',
      '    --headline "제목" \\',
      '    --description "설명" \\',
      '    --pc-url "https://biz.zucca100.com/posts/슬러그" \\',
      "    [--mobile-url URL] [--channel 이름또는도메인일부] [--daily-budget 10000] [--execute]",
      "",
      "--execute를 주지 않으면 실제로 생성하지 않고 미리보기만 합니다.",
    ].join("\n")
  );
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const required = ["name", "adgroup", "headline", "description", "pc-url"];
  const missing = required.filter((k) => !args[k]);
  if (missing.length > 0) {
    console.error("필수 옵션 누락: " + missing.map((k) => "--" + k).join(", "));
    printUsageAndExit();
  }

  const pcUrl = args["pc-url"];
  const mobileUrl = args["mobile-url"] || pcUrl;
  const dailyBudget = args["daily-budget"] ? Number(args["daily-budget"]) : undefined;

  console.log("채널 목록 조회 중...");
  const channels = await listChannels();
  if (!Array.isArray(channels) || channels.length === 0) {
    console.error(
      "등록된 비즈채널이 없습니다. manage.searchad.naver.com에서 먼저 사이트를 비즈채널로 등록해야 합니다."
    );
    process.exit(1);
  }

  let matched = channels;
  if (args.channel) {
    const needle = args.channel.toLowerCase();
    matched = channels.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(needle)) ||
        (c.channelKey && c.channelKey.toLowerCase().includes(needle))
    );
  }

  if (matched.length === 0) {
    console.error("--channel 조건에 맞는 비즈채널을 찾지 못했습니다. 전체 채널 목록:");
    channels.forEach((c) =>
      console.error(`  - ${c.name} (id: ${c.nccBusinessChannelId}, key: ${c.channelKey})`)
    );
    process.exit(1);
  }
  if (matched.length > 1) {
    console.error("비즈채널이 여러 개 매칭됩니다. --channel로 더 좁혀주세요:");
    matched.forEach((c) =>
      console.error(`  - ${c.name} (id: ${c.nccBusinessChannelId}, key: ${c.channelKey})`)
    );
    process.exit(1);
  }

  const channel = matched[0];

  console.log("\n=== 생성 계획 ===");
  console.log(`비즈채널: ${channel.name} (${channel.nccBusinessChannelId})`);
  console.log(`캠페인명: ${args.name}${dailyBudget ? ` (일 예산 ${dailyBudget}원)` : " (예산 미설정)"}`);
  console.log(`광고그룹명: ${args.adgroup}`);
  console.log(`소재 제목: ${args.headline}`);
  console.log(`소재 설명: ${args.description}`);
  console.log(`PC 랜딩 URL: ${pcUrl}`);
  console.log(`모바일 랜딩 URL: ${mobileUrl}`);
  console.log("※ 키워드는 이 스크립트가 등록하지 않습니다 — 관리시스템에서 직접 추가하세요.");

  if (!args.execute) {
    console.log("\n[DRY RUN] 실제로 생성하지 않았습니다. 위 내용이 맞으면 --execute를 추가해 다시 실행하세요.");
    return;
  }

  console.log("\n캠페인 생성 중...");
  const campaign = await createCampaign({ name: args.name, dailyBudget });
  console.log(`캠페인 생성됨: ${campaign.nccCampaignId}`);

  console.log("광고그룹 생성 중...");
  let adgroup;
  try {
    adgroup = await createAdgroup({
      campaignId: campaign.nccCampaignId,
      name: args.adgroup,
      businessChannelId: channel.nccBusinessChannelId,
    });
  } catch (err) {
    console.error(
      `광고그룹 생성 실패. 캠페인(${campaign.nccCampaignId})은 이미 생성됐으니 관리시스템에서 확인/정리하세요.`
    );
    throw err;
  }
  console.log(`광고그룹 생성됨: ${adgroup.nccAdgroupId}`);

  console.log("소재 등록 중...");
  let ad;
  try {
    ad = await createAd({
      adgroupId: adgroup.nccAdgroupId,
      headline: args.headline,
      description: args.description,
      pcUrl,
      mobileUrl,
    });
  } catch (err) {
    console.error(
      `소재 등록 실패. 캠페인(${campaign.nccCampaignId})/광고그룹(${adgroup.nccAdgroupId})은 이미 생성됐으니 관리시스템에서 확인/정리하세요.`
    );
    throw err;
  }
  console.log(`소재 등록됨: ${ad.nccAdId}`);

  console.log("\n완료. 관리시스템에서 키워드를 추가하고 심사 상태를 확인하세요:");
  console.log("https://manage.searchad.naver.com");
}

main().catch((err) => {
  console.error("\n오류:", err.message);
  process.exit(1);
});
