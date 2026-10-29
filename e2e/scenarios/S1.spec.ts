import { expect, test } from "@playwright/test"

test("S1 처음 온 학생이 가입하고 프로필을 저장한다", async ({ page }) => {
  await page.goto("/")
  // 1. 첫 화면에서 [시작하기]를 누른다
  await page.getByRole("link", { name: "시작하기", exact: true }).click()
  // 2. 이메일과 비밀번호를 입력하고 [가입하기]를 누른다
  await page.getByRole("textbox", { name: "이메일" }).fill(`s1-${Date.now()}@example.com`)
  await page.getByRole("textbox", { name: "비밀번호" }).fill("password-1234")
  await page.getByRole("button", { name: "가입하기", exact: true }).click()
  // 3. 평소 잠드는 시각에서 01:00을 고른다
  await page.getByLabel("평소 잠드는 시각").fill("01:00")
  // 4. 민감도에서 "보통"을 고른다
  await page.getByRole("button", { name: "보통", exact: true }).click()
  // 5. [저장]을 누른다
  await page.getByRole("button", { name: "저장", exact: true }).click()
  await expect(page).toHaveURL(/\/home/)
  // 6. 화면을 새로고침한다
  await page.reload()
  // 7. 홈에서 [프로필]을 누른다
  await page.getByRole("link", { name: "프로필", exact: true }).click()
  // expected
  await expect(page.getByLabel("평소 잠드는 시각")).toHaveValue("01:00")
  await expect(page.getByTestId("sensitivity")).toHaveText("보통")
})
