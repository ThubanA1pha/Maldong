import { expect, test } from "@playwright/test"
import { logIn, todayCount } from "../scenarios/_login"

test("첫 화면 소개가 작은 모바일 화면에서도 두 줄로 표시된다", async ({ page }, testInfo) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto("/")
    const tagline = page.locator("header p")
    await expect(tagline).toHaveText("오늘 밤 푹 자고 싶다면, 마시기 전 카페인을 확인해요.")
    const layout = await tagline.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const lines = new Set(Array.from(range.getClientRects()).filter((rect) => rect.width > 0).map((rect) => Math.round(rect.top)))
      return { lines: lines.size, overflow: document.documentElement.scrollWidth > window.innerWidth }
    })
    expect(layout).toEqual({ lines: 2, overflow: false })
    if (width === 390) await page.screenshot({ path: testInfo.outputPath("landing-390.png"), fullPage: true })
  }
})

test("가입 첫 안내와 프로필 저장 완료가 연결된다", async ({ page }) => {
  await logIn(page)
  await page.goto("/profile?first=1")
  await expect(page.getByText("먼저 잘 시각과 민감도를 알려 줘.", { exact: false })).toBeVisible()
  await page.getByLabel("평소 잠드는 시각").fill("04:30")
  await page.getByRole("button", { name: "저장", exact: true }).click()
  await expect(page).toHaveURL(/\/home\?notice=saved$/)
  await expect(page.getByText("설정을 저장했어. 오늘 밤을 같이 확인해 보자.")).toBeVisible()
  const profile = await page.request.get("/api/profile")
  expect((await profile.json()).usualBedtime).toBe("04:30")
})

test("취침 시각 로드 실패를 한국어로 안내하고 같은 화면에서 재시도한다", async ({ page }) => {
  await logIn(page)
  await page.request.put("/api/profile", { data: { usualBedtime: "01:00", sensitivity: "normal" } })
  let failing = true
  await page.route("**/api/profile", (route) => failing ? route.abort("failed") : route.continue())
  await page.goto("/drink/situation?mode=cafe&drinkId=mega-iced-americano-r")
  const error = page.getByRole("alert").filter({ hasText: "인터넷이 잠깐 끊긴 것 같아" })
  await expect(error).toBeVisible()
  await expect(page.getByRole("button", { name: "오늘도 01:00" })).toHaveCount(0)
  failing = false
  await page.getByRole("button", { name: "다시 시도하기" }).click()
  await expect(page.getByRole("button", { name: "오늘도 01:00" })).toBeVisible()
  await expect(error).toHaveCount(0)
})

test("직접 고른 취침 시각과 카페 진입 모드가 뒤로 가기에도 유지된다", async ({ page }) => {
  await logIn(page)
  await page.goto("/drink/situation?mode=cafe&drinkId=mega-iced-americano-r")
  await page.getByRole("button", { name: "바꾸기", exact: true }).click()
  await page.getByLabel("다른 시각 직접 고르기").fill("04:30")
  await page.getByRole("button", { name: "이 시각으로 확인" }).click()
  await expect(page).toHaveURL(/\/drink\/preview\?/)
  expect(new URL(page.url()).searchParams.get("bedtime")).toBe("04:30")
  expect(new URL(page.url()).searchParams.get("mode")).toBe("cafe")
  await expect(page.getByRole("group", { name: "선택지" })).toBeVisible()
  await page.getByRole("link", { name: "뒤로 가기" }).click()
  await expect(page.getByRole("button", { name: "오늘도 04:30" })).toBeVisible()
  await expect(page.getByRole("button", { name: "이미 음료가 있어요", exact: true })).toHaveCount(0)
  await page.getByRole("button", { name: "뒤로", exact: true }).click()
  await expect(page).toHaveURL(/\/drink\/select\?/)
  expect(new URL(page.url()).searchParams.get("mode")).toBe("cafe")
  await expect(page.getByRole("button", { name: "메가커피 아메리카노 (ICE)", exact: true })).toHaveAttribute("aria-pressed", "true")
})

test("삭제한 기록을 화면에서 되돌리면 목록과 잔 수가 복구된다", async ({ page }) => {
  await logIn(page)
  const created = await page.request.post("/api/records", { data: { drinkId: "mega-iced-americano-r", option: "third", bedtime: "22:00" } })
  expect(created.ok()).toBeTruthy()
  const { id } = await created.json()
  const before = (await (await page.request.get("/api/records")).json()).length
  await page.goto("/today")
  const first = page.getByRole("listitem").first()
  await expect(first).toContainText("메가커피 아메리카노 (ICE)")
  await first.getByRole("button", { name: "취소", exact: true }).click()
  await page.getByRole("button", { name: "지우기", exact: true }).click()
  await expect(page.getByTestId("today-count")).toContainText(`오늘 커피 ${before - 1}잔`)
  let failing = true
  await page.route("**/api/records/*/restore", (route) => failing ? route.abort("failed") : route.continue())
  await page.getByRole("button", { name: "되돌리기", exact: true }).click()
  await expect(page.getByRole("alert").filter({ hasText: "인터넷이 잠깐 끊긴 것 같아" })).toBeVisible()
  await expect(page.getByTestId("today-count")).toContainText(`오늘 커피 ${before - 1}잔`)
  failing = false
  await page.getByRole("button", { name: "다시 시도하기" }).click()
  await expect(page.getByTestId("today-count")).toContainText(`오늘 커피 ${before}잔`)
  const records = await (await page.request.get("/api/records")).json()
  expect(records.filter((r: { id: string }) => r.id === id)).toHaveLength(1)
  await expect(page.getByText("되돌렸어. 기록이 다시 생겼어.")).toBeVisible()
})

test("기록 저장 실패 뒤 선택한 양을 유지하고 재시도할 수 있다", async ({ page }) => {
  await logIn(page)
  const before = await todayCount(page)
  await page.goto("/drink/preview?drinkId=mega-iced-americano-r&situation=have&bedtime=22%3A00&mode=before")
  const half = page.getByRole("group", { name: "선택지" }).getByRole("button", { name: /^반만/ })
  await half.click()
  let failing = true
  await page.route("**/api/records", (route) => failing && route.request().method() === "POST" ? route.abort("failed") : route.continue())
  await page.getByRole("button", { name: "이 양으로 마시기 시작", exact: true }).click()
  await expect(page.getByRole("alert").filter({ hasText: "인터넷이 잠깐 끊긴 것 같아" })).toBeVisible()
  await expect(half).toHaveAttribute("aria-pressed", "true")
  failing = false
  await page.getByRole("button", { name: "다시 시도하기" }).click()
  await expect(page).toHaveURL(/\/home\?notice=recorded$/)
  expect(await todayCount(page)).toBe(before + 1)
})

test("프로필 API가 실제로 존재하지 않는 시각을 거절한다", async ({ page }) => {
  await logIn(page)
  const before = await (await page.request.get("/api/profile")).json()
  const response = await page.request.put("/api/profile", { data: { usualBedtime: "99:99", sensitivity: "normal" } })
  expect(response.status()).toBe(400)
  expect((await response.json()).error).toBe("잘 시각을 다시 골라 주세요.")
  expect(await (await page.request.get("/api/profile")).json()).toEqual(before)
})
