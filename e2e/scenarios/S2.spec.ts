import { expect, test } from "@playwright/test"
import { logIn, todayCount } from "./_login"

test("S2 이미 받은 커피를 마시기 직전에 확인하고 반만 마시기로 한다", async ({ page }) => {
  await logIn(page)
  const before = await todayCount(page)
  // 1. 홈에서 [마시기 전 확인]을 누른다
  await page.getByRole("link", { name: "마시기 전 확인" }).first().click()
  // 2. 음료 목록에서 "메가커피 아이스 아메리카노"를 고른다
  await page.getByRole("button", { name: /메가커피 아이스 아메리카노/ }).click()
  // 3. 사이즈에서 "라지"를 고른다
  await page.getByRole("button", { name: "라지", exact: true }).click()
  // 4. [이미 음료가 있어요]를 누른다
  await page.getByRole("button", { name: "이미 음료가 있어요" }).click()
  // 5. [오늘도 01:00]을 누른다
  await page.getByRole("button", { name: "오늘도 01:00" }).click()
  // 6. 선택지에서 [반만]을 누른다
  const full = page.getByRole("button", { name: /^그대로/ })
  const half = page.getByRole("button", { name: /^반만/ })
  await half.click()
  const fullMg = Number(await full.getAttribute("data-added-mg"))
  const halfMg = Number(await half.getAttribute("data-added-mg"))
  expect(Math.abs(fullMg / 2 - halfMg)).toBeLessThanOrEqual(1)
  // 7. [이 양으로 마시기 시작]을 누른다
  await page.getByRole("button", { name: "이 양으로 마시기 시작" }).click()
  await expect(page).toHaveURL(/\/home/)
  expect(await todayCount(page)).toBe(before + 1)
  await page.getByRole("link", { name: /오늘 커피 \d+잔/ }).first().click()
  await expect(page.getByText("메가커피 아이스 아메리카노 라지 · 반만").first()).toBeVisible()
})
