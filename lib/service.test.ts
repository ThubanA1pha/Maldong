import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  profile: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  drink: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn() },
  record: { findMany: vi.fn(), create: vi.fn() },
}));
vi.mock("./db", () => ({ db }));
import { createRecord, preview, updateProfile } from "./service";

const now = new Date("2026-10-30T12:00:00+09:00");
const drink = { id: "mega-iced-americano-r", brand: "메가커피", menu: "아메리카노 (ICE)", size: "710ml", caffeineMg: 236, sourceUrl: "https://example.com/source" };

beforeEach(() => {
  vi.resetAllMocks();
  db.profile.findUniqueOrThrow.mockResolvedValue({ usualBedtime: "22:00", sensitivity: "normal" });
  db.drink.findUnique.mockResolvedValue(drink);
  db.drink.findUniqueOrThrow.mockResolvedValue(drink);
  db.record.findMany.mockResolvedValue([{ plannedMg: 320, startedAt: now }]);
  db.record.create.mockResolvedValue({ id: "record" });
});

describe("preview consistency", () => {
  it("does not recommend a rounded total of 100mg", async () => {
    const result = await preview("user", drink.id, "have", "22:00", now);
    expect(result.beforeMg).toBe(80);
    expect(result.options.find((o) => o.option === "third")).toMatchObject({ addedMg: 20, totalMg: 100, band: "high" });
    expect(result.recommend).toBe("stop");
  });
  it("uses the same dose rounding when previewing and saving", async () => {
    const result = await preview("user", drink.id, "have", "22:00", now);
    await createRecord("user", { drinkId: drink.id, option: "third", bedtime: "22:00" }, now);
    const saved = db.record.create.mock.calls[0][0].data;
    expect(saved.plannedMg).toBe(79);
    expect(saved.predictedBand).toBe(result.options.find((o) => o.option === "third")!.band);
  });
  it("returns the actual calculation target when bedtime has passed", async () => {
    db.record.findMany.mockResolvedValue([]);
    const result = await preview("user", drink.id, "have", "01:00", new Date("2026-10-30T01:40:00+09:00"));
    expect(result.late).toBe(true);
    expect(result.options[0].addedMg).toBe(236);
  });
});

describe("profile time validation", () => {
  it.each(["99:99", "24:00", "01:60"])("rejects %s before writing", async (time) => {
    await expect(updateProfile("user", time, "normal")).rejects.toThrow("잘 시각을 다시 골라 주세요.");
    expect(db.profile.update).not.toHaveBeenCalled();
  });
});
