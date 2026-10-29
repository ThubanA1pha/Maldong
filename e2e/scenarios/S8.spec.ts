import { expect, test } from "@playwright/test"
import { E2E_TIRED_EMAIL, E2E_TIRED_PASSWORD } from "../env"
import { logIn } from "./_login"

test("S8 많이 마신 날 카페 앞에서 캐릭터가 먼저 말을 걸고 디카페인으로 주문하기로 한다", async ({ page, context }) => {
  // 1. 등록된 카페 앞에서 홈을 연다 (시드의 대회장 좌표, 계정: 피곤한 학생)
  await context.grantPermissions(["geolocation"])
  await context.setGeolocation({ latitude: 35.165706, longitude: 126.907069 })
  await logIn(page, E2E_TIRED_EMAIL, E2E_TIRED_PASSWORD)
  // 2. "카페 앞이네? 또 마시는 거야…?" 말풍선에서 [뭐 마실지 볼래]를 누른다
  await expect(page.getByText(/카페 앞이네\? 또 마시는 거야…\?/).first()).toBeVisible()
  await page.getByRole("link", { name: "뭐 마실지 볼래" }).click()
  // 3. 음료 목록에서 "스타벅스 아이스 아메리카노"를 고른다
  await page.getByRole("button", { name: /스타벅스 아이스 아메리카노/ }).click()
  // 4. 사이즈에서 "톨"을 고른다
  await page.getByRole("button", { name: "톨", exact: true }).click()
  // 5. [오늘도 …]를 누른다
  await page.getByRole("button", { name: /^오늘도 / }).click()
  // 6. 선택지에서 [디카페인]을 누른다
  const original = page.getByRole("button", { name: /^원래대로/ })
  const decaf = page.getByRole("button", { name: /^디카페인/ })
  await decaf.click()
  expect(Number(await decaf.getAttribute("data-added-mg"))).toBeLessThan(Number(await original.getAttribute("data-added-mg")))
  // 7. [이 양으로 마시기 시작]을 누른다
  await page.getByRole("button", { name: "이 양으로 마시기 시작" }).click()
  await expect(page).toHaveURL(/\/home/)
  await page.getByRole("link", { name: /오늘 커피 \d+잔/ }).first().click()
  await expect(page.getByText("스타벅스 아이스 아메리카노 톨 · 디카페인").first()).toBeVisible()
})
