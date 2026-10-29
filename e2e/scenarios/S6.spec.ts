import { expect, test } from "@playwright/test"
import { logIn, todayCount } from "./_login"

test("S6 잘못 넣은 오늘 기록을 지운다", async ({ page }) => {
  await logIn(page)
  const before = await todayCount(page)
  await page.getByRole("link", { name: /오늘 커피 \d+잔/ }).first().click()
  const row = page.getByRole("listitem").filter({ hasText: "컴포즈커피 I-카페라떼 591ml" })
  await row.getByRole("button", { name: "취소" }).click()
  await expect(page.getByText("이 기록을 지울까?")).toBeVisible()
  await page.getByRole("button", { name: "지우기", exact: true }).click()
  await expect(page.getByRole("listitem").filter({ hasText: "컴포즈커피 I-카페라떼 591ml" })).toHaveCount(0)
  await expect(page.getByText(`오늘 커피 ${before - 1}잔`).first()).toBeVisible()
})
