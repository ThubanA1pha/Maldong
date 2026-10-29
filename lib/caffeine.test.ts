import { describe, expect, it } from "vitest";
import { addedAtBedtime, adjustSensitivity, band, isPastBedtime, isValidBedtime, nextBedtime, recommend, remaining, totalAtBedtime } from "./caffeine";

const at = (s: string) => new Date(`${s}+09:00`); // 한국 시간으로 읽는다(서버 시간대와 무관)

describe("remaining", () => {
  it("halves after one half-life", () => {
    expect(remaining(200, at("2026-10-29T20:00:00"), at("2026-10-30T01:00:00"), 5)).toBeCloseTo(100);
  });
  it("is zero before the drink", () => {
    expect(remaining(200, at("2026-10-29T20:00:00"), at("2026-10-29T19:00:00"), 5)).toBe(0);
  });
});

describe("nextBedtime", () => {
  it("rolls to the next day after midnight target", () => {
    expect(nextBedtime(at("2026-10-29T21:00:00"), "01:00")).toEqual(at("2026-10-30T01:00:00"));
  });
  it("treats a just-passed bedtime as now", () => {
    expect(nextBedtime(at("2026-10-30T01:40:00"), "01:00")).toEqual(at("2026-10-30T01:40:00"));
    expect(nextBedtime(at("2026-10-29T23:30:00"), "23:00")).toEqual(at("2026-10-29T23:30:00"));
  });
  it("moves to tomorrow when bedtime passed long ago", () => {
    expect(nextBedtime(at("2026-10-30T13:00:00"), "01:00")).toEqual(at("2026-10-31T01:00:00"));
  });
  it("same day when still ahead", () => {
    expect(nextBedtime(at("2026-10-29T21:00:00"), "23:30")).toEqual(at("2026-10-29T23:30:00"));
  });
});

describe("isPastBedtime", () => {
  it("is true only while bedtime passed within LATE_HOURS", () => {
    expect(isPastBedtime(at("2026-10-30T01:30:00"), "01:00")).toBe(true);
    expect(isPastBedtime(at("2026-10-29T21:00:00"), "01:00")).toBe(false);
    expect(isPastBedtime(at("2026-10-30T13:00:00"), "01:00")).toBe(false);
  });
});

describe("half option is half of full within 1mg", () => {
  it("for any time", () => {
    for (const hour of [9, 15, 21]) {
      const now = at(`2026-10-29T${String(hour).padStart(2, "0")}:00:00`);
      const bed = nextBedtime(now, "01:00");
      const full = addedAtBedtime(300, now, bed, 5);
      const half = addedAtBedtime(150, now, bed, 5);
      expect(Math.abs(full / 2 - half)).toBeLessThanOrEqual(1);
    }
  });
});

describe("band and recommend", () => {
  it("bands at 30 and 100", () => {
    expect(band(29)).toBe("ok");
    expect(band(30)).toBe("mid");
    expect(band(100)).toBe("high");
  });
  it("recommends the largest portion under 100mg", () => {
    expect(recommend([{ option: "full", totalMg: 80 }])).toBe("full");
    expect(recommend([{ option: "third", totalMg: 60 }, { option: "half", totalMg: 80 }, { option: "full", totalMg: 140 }])).toBe("half");
    expect(recommend([{ option: "full", totalMg: 139 }, { option: "half", totalMg: 110 }, { option: "third", totalMg: 100 }])).toBe("stop");
    expect(recommend([{ option: "full", totalMg: 140 }, { option: "half", totalMg: 110 }, { option: "third", totalMg: 99 }])).toBe("third");
  });
  it("totals several records", () => {
    const bed = at("2026-10-30T01:00:00");
    expect(totalAtBedtime([{ mg: 200, startedAt: at("2026-10-29T20:00:00") }, { mg: 100, startedAt: at("2026-10-29T20:00:00") }], bed, 5)).toBe(150);
  });
});

describe("isValidBedtime", () => {
  it.each(["99:99", "24:00", "12:60", "1:00", "", null])("rejects invalid time %s", (time) => {
    expect(isValidBedtime(time)).toBe(false);
  });
  it.each(["00:00", "04:30", "23:59"])("accepts time %s", (time) => {
    expect(isValidBedtime(time)).toBe(true);
  });
});

describe("adjustSensitivity", () => {
  it("moves up on the second worse answer", () => {
    const first = adjustSensitivity({ sensitivity: "normal", direction: null, count: 0 }, "ok", "tossed");
    expect(first).toMatchObject({ sensitivity: "normal", count: 1, changed: false });
    const second = adjustSensitivity(first, "ok", "barely");
    expect(second).toMatchObject({ sensitivity: "sensitive", count: 0, changed: true });
  });
  it("resets on an unrelated answer", () => {
    expect(adjustSensitivity({ sensitivity: "normal", direction: "worse", count: 1 }, "ok", "great")).toMatchObject({ count: 0, changed: false });
  });
  it("stays at the edge", () => {
    expect(adjustSensitivity({ sensitivity: "sensitive", direction: "worse", count: 1 }, "mid", "tossed")).toMatchObject({ sensitivity: "sensitive", changed: false });
  });
});
