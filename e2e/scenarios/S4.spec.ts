import { expect, test } from "@playwright/test"
import { logIn } from "./_login"

test("S4 카페 앞에서 캐릭터가 먼저 말을 걸고 하프샷으로 주문하기로 한다", async ({ page, context }) => {
  // 1. 등록된 카페 앞에서 홈을 연다 (시드의 대회장 좌표)
  await context.grantPermissions(["geolocation"])
  await context.setGeolocation({ latitude: 35.165706, longitude: 126.907069 })
  await logIn(page)
  // 2. 캐릭터의 "카페 앞이네?" 말풍선에서 [뭐 마실지 볼래]를 누른다
  await expect(page.getByText(/카페 앞이네\?/).first()).toBeVisible()
  await page.getByRole("link", { name: "뭐 마실지 볼래" }).click()
  await page.getByRole("button", { name: /빽다방 아이스 아메리카노/ }).click()
  await page.getByRole("button", { name: "레귤러", exact: true }).click()
  await page.getByRole("button", { name: "오늘도 01:00" }).click()
  const original = page.getByRole("button", { name: /^원래대로/ })
  const halfshot = page.getByRole("button", { name: /^하프샷/ })
  await halfshot.click()
  const o = Number(await original.getAttribute("data-added-mg"))
  const h = Number(await halfshot.getAttribute("data-added-mg"))
  expect(Math.abs(o / 2 - h)).toBeLessThanOrEqual(1)
  await page.getByRole("button", { name: "이 양으로 마시기 시작" }).click()
  await expect(page).toHaveURL(/\/home/)
  await page.getByRole("link", { name: /오늘 커피 \d+잔/ }).first().click()
  await expect(page.getByText("빽다방 아이스 아메리카노 레귤러 · 하프샷").first()).toBeVisible()
})
