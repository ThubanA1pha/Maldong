import { expect, type Page } from "@playwright/test"
import { E2E_USER_EMAIL, E2E_USER_PASSWORD } from "../env"

// 로그인은 steps에 쓰지 않지만 화면으로 한다. 첫 화면에서 [로그인]을 눌러 들어간다.
export async function logIn(page: Page) {
  await page.goto("/")
  await page.getByRole("link", { name: "로그인", exact: true }).click()
  await page.getByRole("textbox", { name: "이메일" }).fill(E2E_USER_EMAIL)
  await page.getByRole("textbox", { name: "비밀번호" }).fill(E2E_USER_PASSWORD)
  await page.getByRole("button", { name: "로그인", exact: true }).click()
  await expect(page).toHaveURL(/\/home/)
}

export async function todayCount(page: Page): Promise<number> {
  const text = await page.getByRole("link", { name: /오늘 커피 \d+잔/ }).first().innerText()
  return Number(text.match(/(\d+)잔/)![1])
}
