// [공통] 시드. docker compose up 때마다 실행해도 같은 상태가 되게 한다(빈 DB 기준).
// 시드 계정 상태는 docs/scenarios.yaml 맨 위 주석과 같아야 한다.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";

const db = new PrismaClient();
const data = JSON.parse(readFileSync(new URL("./drinks.json", import.meta.url), "utf8"));

const EMAIL = process.env.SEED_USER_EMAIL ?? "student@example.com";
const PASSWORD = process.env.SEED_USER_PASSWORD ?? "loopthon-2026";
const TIRED_EMAIL = process.env.SEED_TIRED_EMAIL ?? "tired@example.com";
const TIRED_PASSWORD = process.env.SEED_TIRED_PASSWORD ?? "loopthon-2026";

const HOUR = 3_600_000;
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

async function main() {
  for (const d of data.drinks) {
    const row = { brand: d.brand, menu: d.menu, size: d.size, sizeRank: d.sizeRank, caffeineMg: d.caffeineMg, isDecaf: !!d.isDecaf, sourceUrl: d.sourceUrl };
    await db.drink.upsert({ where: { id: d.id }, create: { id: d.id, ...row }, update: row });
  }
  for (const c of data.cafes) {
    const row = { name: c.name, lat: c.lat, lng: c.lng, radiusM: c.radiusM ?? 50 };
    await db.cafe.upsert({ where: { id: c.id }, create: { id: c.id, ...row }, update: row });
  }

  // 공개 배포(Vercel)에서는 저장소에 적힌 기본 비밀번호로 데모 계정을 만들지 않는다.
  // 배포 환경변수에 SEED_USER_PASSWORD·SEED_TIRED_PASSWORD를 따로 넣었을 때만 만든다.
  if (process.env.VERCEL && (!process.env.SEED_USER_PASSWORD || !process.env.SEED_TIRED_PASSWORD)) {
    console.log("seed: 배포 환경에 데모 계정 비밀번호가 없어 계정은 만들지 않음 (음료·카페만)");
    return;
  }

  await seedTired();
  if (await db.user.findUnique({ where: { email: EMAIL } })) return; // 이미 시드됨
  const user = await db.user.create({
    data: {
      email: EMAIL,
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      profile: { create: { usualBedtime: "01:00", sensitivity: "normal", mismatchDirection: "worse", mismatchCount: 1 } },
    },
  });

  const today = startOfToday();
  const mg = (id, f = 1) => Math.round(data.drinks.find((d) => d.id === id).caffeineMg * f);
  const rec = (drinkId, option, startedAt, extra = {}) =>
    db.record.create({ data: { userId: user.id, drinkId, option, plannedMg: mg(drinkId), startedAt, bedtime: "01:00", predictedBand: "ok", ...extra } });

  // 오늘 기록 1건: S6이 지운다. 이 이름은 오늘 목록에 하나뿐이어야 한다.
  const todayAt = new Date(Math.max(today.getTime() + 60_000, Date.now() - 2 * HOUR));
  await rec("compose-latte-r", "already", todayAt);

  // 어제 기록 1건, 확인 전: S7의 확인 카드. 예측 ok + 못 잤다는 답이 두 번째가 되면 민감도가 오른다.
  await rec("sbux-iced-americano-t", "full", new Date(today.getTime() - 9 * HOUR));

  // 지난 5일 기록 여러 건(확인 완료): 화면이 비어 보이지 않게.
  const past = [
    ["mega-iced-americano-r", "full", 2, 15, "all", "ok"],
    ["paik-iced-americano-r", "half", 2, 20, "half", "great"],
    ["sbux-latte-t", "full", 3, 10, "all", "great"],
    ["compose-iced-americano-r", "full", 3, 19, "all", "tossed"],
    ["mega-latte-r", "third", 4, 14, "little", "great"],
    ["paik-latte-r", "full", 5, 11, "all", "ok"],
    ["sbux-iced-americano-g", "half", 5, 21, "half", "ok"],
  ];
  for (const [drinkId, option, daysAgo, hour, portion, sleep] of past) {
    const at = new Date(today.getTime() - daysAgo * 24 * HOUR + hour * HOUR);
    await rec(drinkId, option, at, { confirmedPortion: portion, sleepAnswer: sleep, answeredAt: new Date(at.getTime() + 12 * HOUR) });
  }
}

// 계정 "피곤한 학생"(S8 데모): 시드 시각 기준 잠드는 시각은 2시간 뒤, 1시간 전에 메가커피 아이스 아메리카노 라지를 다 마셨다.
// 그래서 언제 테스트해도 잘 때 남을 카페인이 "많이 남음"(100mg 이상)에서 시작한다.
async function seedTired() {
  if (await db.user.findUnique({ where: { email: TIRED_EMAIL } })) return;
  const now = Date.now();
  const bed = new Date(now + 2 * HOUR);
  const bedtime = `${String(bed.getHours()).padStart(2, "0")}:${String(bed.getMinutes()).padStart(2, "0")}`;
  const drink = data.drinks.find((d) => d.id === "mega-iced-americano-l");
  await db.user.create({
    data: {
      email: TIRED_EMAIL,
      passwordHash: await bcrypt.hash(TIRED_PASSWORD, 10),
      profile: { create: { usualBedtime: bedtime, sensitivity: "normal", mismatchDirection: null, mismatchCount: 0 } },
      records: { create: {
        drinkId: drink.id, option: "already", plannedMg: drink.caffeineMg, bedtime, predictedBand: "high",
        startedAt: new Date(Math.max(startOfToday().getTime() + 60_000, now - HOUR)),
      } },
    },
  });
}

main()
  .then(() => console.log("seed ok"))
  .catch((e) => { console.error("seed failed:", e.message); process.exit(1); })
  .finally(() => db.$disconnect());
