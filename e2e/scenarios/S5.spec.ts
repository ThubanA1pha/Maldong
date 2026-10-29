import { expect, test } from "@playwright/test"
import { logIn, todayCount } from "./_login"

test("S5 이미 마신 커피를 나중에 기록한다", async ({ page }) => {
  await logIn(page)
  const before = await todayCount(page)
  await page.getByRole("link", { name: "이미 마신 음료 기록" }).first().click()
  await page.getByRole("button", { name: "컴포즈커피 I-아메리카노" }).click()
  await page.getByRole("button", { name: "591ml", exact: true }).click()
  await page.getByRole("button", { name: "기록하기" }).click()
  await expect(page).toHaveURL(/\/home/)
  expect(await todayCount(page)).toBe(before + 1)
  await page.getByRole("link", { name: /오늘 커피 \d+잔/ }).first().click()
  await expect(page.getByText("컴포즈커피 I-아메리카노 591ml · 다 마심").first()).toBeVisible()
})
