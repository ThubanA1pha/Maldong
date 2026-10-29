// [공통] 데이터 처리. 화면과 API는 이 함수만 부른다(Prisma를 직접 부르지 않는다).
// 시각은 서버의 현재 시각(TZ=Asia/Seoul)을 쓴다.
import bcrypt from "bcryptjs";
import { db } from "./db";
import {
  HALF_LIFE_H, OPTION_FACTOR, startOfDayKST, OPTIONS_BY_SITUATION, addedAtBedtime, adjustSensitivity, band, nextBedtime, recommend, totalAtBedtime,
  type Band, type Option, type Sensitivity, type Situation, type SleepAnswer,
} from "./caffeine";
import { drinkLabel, recordLabel } from "./copy";

export class UserError extends Error {}

const startOfToday = (now: Date) => startOfDayKST(now);

// ---- 가입·로그인 (F1) ----
export async function signup(email: string, password: string) {
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserError("이메일을 확인해 주세요.");
  if (password.length < 8) throw new UserError("비밀번호는 8자 이상이어야 해요.");
  if (await db.user.findUnique({ where: { email } })) throw new UserError("이미 가입한 이메일이에요.");
  const user = await db.user.create({
    data: { email, passwordHash: await bcrypt.hash(password, 10), profile: { create: {} } },
  });
  return user.id;
}

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UserError("이메일 또는 비밀번호가 맞지 않아요.");
  return user.id;
}

// ---- 프로필 (F1·F6) ----
export async function getProfile(userId: string) {
  const p = await db.profile.findUniqueOrThrow({ where: { userId } });
  return { usualBedtime: p.usualBedtime, sensitivity: p.sensitivity as Sensitivity };
}

export async function updateProfile(userId: string, usualBedtime: string, sensitivity: Sensitivity) {
  if (!/^\d{2}:\d{2}$/.test(usualBedtime)) throw new UserError("잠드는 시각을 골라 주세요.");
  if (!Object.hasOwn(HALF_LIFE_H, sensitivity)) throw new UserError("민감도를 골라 주세요.");
  await db.profile.update({ where: { userId }, data: { usualBedtime, sensitivity } });
}

// ---- 음료·카페 ----
export async function listDrinks() {
  const drinks = await db.drink.findMany({ where: { isDecaf: false }, orderBy: [{ brand: "asc" }, { menu: "asc" }, { sizeRank: "asc" }] });
  return drinks.map((d) => ({ id: d.id, brand: d.brand, menu: d.menu, size: d.size, caffeineMg: d.caffeineMg, estimated: !d.sourceUrl }));
}

export async function nearCafe(lat: number, lng: number) {
  const cafes = await db.cafe.findMany();
  const meters = (a: { lat: number; lng: number }) => {
    const r = 6371000, toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(a.lat - lat), dLng = toRad(a.lng - lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(a.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * r * Math.asin(Math.sqrt(h));
  };
  const hit = cafes.find((c) => meters(c) <= c.radiusM);
  return hit ? { id: hit.id, name: hit.name } : null;
}

// ---- 오늘 상태 (F5) ----
async function todayRecords(userId: string, now: Date) {
  return db.record.findMany({ where: { userId, startedAt: { gte: startOfToday(now) } }, include: { drink: true }, orderBy: { startedAt: "desc" } });
}

async function bedtimeTotal(userId: string, now: Date, bedtimeHHMM: string, hl: number) {
  const recs = await db.record.findMany({ where: { userId, startedAt: { gte: new Date(now.getTime() - 48 * 3_600_000) } } });
  return totalAtBedtime(recs.map((r) => ({ mg: r.plannedMg, startedAt: r.startedAt })), nextBedtime(now, bedtimeHHMM), hl);
}

export async function home(userId: string, now = new Date()) {
  const profile = await getProfile(userId);
  const hl = HALF_LIFE_H[profile.sensitivity];
  const today = await todayRecords(userId, now);
  const total = await bedtimeTotal(userId, now, profile.usualBedtime, hl);
  const pending = await db.record.findMany({
    where: { userId, answeredAt: null, startedAt: { lt: startOfToday(now) } }, include: { drink: true }, orderBy: { startedAt: "desc" },
  });
  return {
    usualBedtime: profile.usualBedtime,
    todayCount: today.length,
    bedtimeMg: total,
    band: band(total),
    pendingChecks: pending.map((r) => ({ recordId: r.id, drink: `${r.drink.brand} ${r.drink.menu}` })),
  };
}

export async function listToday(userId: string, now = new Date()) {
  const recs = await todayRecords(userId, now);
  return recs.map((r) => ({ id: r.id, label: recordLabel(r.drink, r.option as Option), startedAt: r.startedAt.toISOString() }));
}

export async function deleteRecord(userId: string, recordId: string) {
  const { count } = await db.record.deleteMany({ where: { id: recordId, userId } }); // 남의 기록은 지워지지 않는다
  if (count === 0) throw new UserError("이미 지웠거나 없는 기록이에요.");
}

// ---- 마시기 전 확인 (F2·F3) ----
async function resolveDrink(drinkId: string, option: Option) {
  const base = await db.drink.findUniqueOrThrow({ where: { id: drinkId } });
  if (option === "small") {
    return db.drink.findFirst({ where: { brand: base.brand, menu: base.menu, isDecaf: false, sizeRank: { lt: base.sizeRank } }, orderBy: { sizeRank: "desc" } });
  }
  if (option === "decaf") return db.drink.findFirst({ where: { brand: base.brand, menu: base.menu, isDecaf: true } });
  return base;
}

export async function preview(userId: string, drinkId: string, situation: Situation, bedtimeHHMM: string, now = new Date()) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(bedtimeHHMM)) throw new UserError("잘 시각을 다시 골라 주세요.");
  if (!(await db.drink.findUnique({ where: { id: drinkId } }))) throw new UserError("목록에 없는 음료예요.");
  const profile = await getProfile(userId);
  const hl = HALF_LIFE_H[profile.sensitivity];
  const bed = nextBedtime(now, bedtimeHHMM);
  const before = await bedtimeTotal(userId, now, bedtimeHHMM, hl);
  const base = await db.drink.findUniqueOrThrow({ where: { id: drinkId } });

  const options = [];
  for (const option of OPTIONS_BY_SITUATION[situation]) {
    const d = await resolveDrink(drinkId, option);
    if (!d) continue; // 작은 사이즈·디카페인이 없는 메뉴는 숨긴다
    const added = addedAtBedtime(d.caffeineMg * OPTION_FACTOR[option], now, bed, hl);
    options.push({ option, drinkId: d.id, addedMg: added, totalMg: before + added, band: band(before + added) });
  }
  const fullAdded = addedAtBedtime(base.caffeineMg, now, bed, hl);
  return {
    drink: drinkLabel(base),
    estimated: !base.sourceUrl,
    bedtime: bedtimeHHMM,
    beforeMg: before,
    beforeBand: band(before),
    recommend: situation === "have" ? recommend(before, fullAdded) : null,
    options,
  };
}

export async function createRecord(userId: string, input: { drinkId: string; option: Option; bedtime: string }, now = new Date()) {
  if (!Object.hasOwn(OPTION_FACTOR, input.option)) throw new UserError("고를 수 없는 선택지예요.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.bedtime)) throw new UserError("잘 시각을 다시 골라 주세요.");
  if (!(await db.drink.findUnique({ where: { id: input.drinkId } }))) throw new UserError("목록에 없는 음료예요.");
  const profile = await getProfile(userId);
  const hl = HALF_LIFE_H[profile.sensitivity];
  const d = await resolveDrink(input.drinkId, input.option);
  if (!d) throw new UserError("이 선택지는 고를 수 없어요.");
  const plannedMg = Math.round(d.caffeineMg * OPTION_FACTOR[input.option]);
  const before = await bedtimeTotal(userId, now, input.bedtime, hl);
  const predictedBand = band(before + addedAtBedtime(plannedMg, now, nextBedtime(now, input.bedtime), hl));
  const r = await db.record.create({
    data: { userId, drinkId: d.id, option: input.option, plannedMg, startedAt: now, bedtime: input.bedtime, predictedBand },
  });
  return { id: r.id };
}

// ---- 확인 질문 (F6) ----
const PORTION_FACTOR = { all: 1, half: 0.5, little: 0.25, none: 0 } as const;

export async function submitCheck(userId: string, recordId: string, portion: keyof typeof PORTION_FACTOR, sleep: SleepAnswer) {
  if (!Object.hasOwn(PORTION_FACTOR, portion)) throw new UserError("마신 양을 골라 주세요.");
  if (!["great", "ok", "tossed", "barely"].includes(sleep)) throw new UserError("잠을 어떻게 잤는지 골라 주세요.");
  const r = await db.record.findFirst({ where: { id: recordId, userId }, include: { drink: true } });
  if (!r) throw new UserError("없는 기록이에요.");
  if (r.answeredAt) throw new UserError("이미 답한 기록이에요.");
  const p = await db.profile.findUniqueOrThrow({ where: { userId } });
  const next = adjustSensitivity(
    { sensitivity: p.sensitivity as Sensitivity, direction: p.mismatchDirection as "worse" | "better" | null, count: p.mismatchCount },
    r.predictedBand as Band,
    sleep,
  );
  const base = Math.round(r.drink.caffeineMg * OPTION_FACTOR[r.option as Option]);
  await db.$transaction([
    db.record.update({
      where: { id: r.id },
      data: { confirmedPortion: portion, sleepAnswer: sleep, answeredAt: new Date(), plannedMg: Math.round(base * PORTION_FACTOR[portion]) },
    }),
    db.profile.update({ where: { userId }, data: { sensitivity: next.sensitivity, mismatchDirection: next.direction, mismatchCount: next.count } }),
  ]);
  const order = ["dull", "normal", "sensitive"];
  const moved = !next.changed ? null : order.indexOf(next.sensitivity) > order.indexOf(p.sensitivity) ? "up" : "down";
  return { sensitivity: next.sensitivity, moved };
}
