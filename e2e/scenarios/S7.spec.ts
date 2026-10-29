import { expect, test } from "@playwright/test"
import { logIn } from "./_login"

test("S7 다음에 앱을 열어 어제 커피와 잠을 알려 주고 민감도가 바뀐다", async ({ page }) => {
  await logIn(page)
  await page.getByRole("region", { name: "어제 스타벅스 아이스 아메리카노 어땠어?" }).getByRole("link", { name: "답하기" }).click()
  await page.getByRole("button", { name: "다", exact: true }).click()
  await page.getByRole("button", { name: "뒤척임", exact: true }).click()
  await expect(page.getByText("요즘 커피에 좀 예민한 것 같아. 앞으로 민감한 편으로 계산할게.")).toBeVisible()
  await page.getByRole("link", { name: "프로필", exact: true }).click()
  await expect(page.getByTestId("sensitivity")).toHaveText("민감한 편")
})
