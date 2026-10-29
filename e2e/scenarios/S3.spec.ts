import { expect, test } from "@playwright/test"
import { logIn, todayCount } from "./_login"

test("S3 비교해 보고 이번에는 마시지 않기로 한다", async ({ page }) => {
  await logIn(page)
  const before = await todayCount(page)
  await page.getByRole("link", { name: "마시기 전 확인" }).first().click()
  await page.getByRole("button", { name: /스타벅스 카페라떼/ }).click()
  await page.getByRole("button", { name: "톨", exact: true }).click()
  await page.getByRole("button", { name: "이미 음료가 있어요" }).click()
  // 5. [바꾸기]를 누른다
  await page.getByRole("button", { name: "바꾸기", exact: true }).click()
  // 6. 잘 시각에서 "00:00"을 고른다
  await page.getByRole("group", { name: "잘 시각" }).getByRole("button", { name: "00:00", exact: true }).click()
  // expected: 미리 보기가 00:00 기준으로 다시 계산된다
  await expect(page.getByText("00시에 남을 양을 같이 비교해 보자.").first()).toBeVisible()
  await page.getByRole("button", { name: "이번에는 마시지 않기" }).click()
  await expect(page.getByText("이번 음료는 마신 기록에 넣지 않을게.")).toBeVisible()
  expect(await todayCount(page)).toBe(before)
})
