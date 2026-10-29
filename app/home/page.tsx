// 담당: ⑤ 홈 (F3·F5·F6 · S2~S7의 출발점). 기준: Figma 02 초원 홈 2-1~2-4, 04 4-4(확인 카드).
// 고정 문구(lib/copy.ts)와 버튼이 가는 주소·쿼리 이름은 바꾸지 않는다(E2E가 그대로 누른다).
// 데이터는 lib/service.ts, 계산 결과는 home()이 lib/caffeine.ts로 낸 값을 그대로 쓴다.
import Link from "next/link";
import { Suspense } from "react";
import { BottomNav } from "@/components/BottomNav";
import { requireUser } from "@/lib/auth";
import { isPastBedtime, type Band } from "@/lib/caffeine";
import { AUTH, BAND_TEXT, BTN, HOME, HOME_LINE, SAY, SENSITIVITY_LABEL, SERVICE_NAME, checkCard, todayLink } from "@/lib/copy";
import { getProfile, home, listToday } from "@/lib/service";
import { HomeHero, type Scene } from "./HomeHero";
import s from "./home.module.css";

export const dynamic = "force-dynamic";

const TZ = "Asia/Seoul";
const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(new Date(iso));

// Figma: 낮 초원(2-1), 저녁·밤 초원(2-2 21:00, 2-3 20:48, 2-4 22:40)
function sceneAt(now: Date): Scene {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: TZ }).format(now)) % 24;
  return hour >= 6 && hour < 18 ? "day" : "night";
}

const BANDS: Band[] = ["ok", "mid", "high"];

// 로그인 확인을 먼저 끝내고(로그인 안 했으면 307로 /login) 그 뒤 계산하는 동안만 로딩 화면을 보인다.
// 라우트 전체 loading.tsx를 두면 응답이 먼저 200으로 나가 리디렉트가 화면에서 일어나므로 쓰지 않는다.
export default async function Home({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const userId = await requireUser();
  const { notice } = await searchParams;
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeBody userId={userId} notice={notice} />
    </Suspense>
  );
}

function HomeLoading() {
  return (
    <main className={s.home} aria-busy="true">
      <div className={s.panel} style={{ marginTop: 0, paddingTop: 24 }}>
        <p className={s.cardSub} role="status">오늘 상태를 불러오는 중이에요…</p>
        <div className={s.skeleton} />
        <div className={s.skeleton} />
      </div>
      <BottomNav active="home" />
    </main>
  );
}

async function HomeBody({ userId, notice }: { userId: string; notice?: string }) {
  const [data, profile, today] = await Promise.all([home(userId), getProfile(userId), listToday(userId)]);
  const label = SENSITIVITY_LABEL[profile.sensitivity];
  const NOTICE: Record<string, string> = {
    saved: AUTH.saved,
    recorded: SAY.recorded,
    skipped: SAY.skipped,
    checked: SAY.thanks,
    sens_up: SAY.sensitiveUp(label),
    sens_down: SAY.sensitiveDown(label),
  };
  const late = isPastBedtime(new Date(), data.usualBedtime); // 잘 시각이 지난 새벽이면 "지금" 기준으로 말한다
  const caption = HOME.bedtimeCaption(data.usualBedtime, late);
  const line = (notice && NOTICE[notice]) || HOME_LINE[data.band](data.usualBedtime, late);
  const last = today[0];
  const [linkPre, linkPost] = todayLink(data.todayCount).split(String(data.todayCount));
  const cups = Math.min(data.todayCount, 3);

  return (
    <main className={s.home}>
      <HomeHero band={data.band} line={line} scene={sceneAt(new Date())} title={SERVICE_NAME} />

      <div className={s.panel}>
        {data.pendingChecks.map((c) => (
          <section key={c.recordId} className={s.checkCard} aria-label={checkCard(c.drink)}>
            <div className={s.grow}>
              <p className={s.cardTitle}>{checkCard(c.drink)}</p>
              <p className={s.cardSub}>{HOME.checkSub}</p>
            </div>
            <Link className={s.answerBtn} href={`/check/${c.recordId}`}>{BTN.answer}</Link>
          </section>
        ))}

        <section className={s.card} aria-label={caption}>
          <div className={s.statusRow}>
            <div>
              <p className={s.cardSub} style={{ margin: 0 }}>{caption}</p>
              <p className={s.bandText} data-testid="home-band">{BAND_TEXT[data.band]}</p>
            </div>
            <span className={`${s.mg} mono`} data-testid="home-bedtime-mg">약 {data.bedtimeMg}mg</span>
          </div>
          <div className={s.meter} aria-hidden="true">
            {BANDS.map((b) => (
              <span key={b} className={`${s.seg} ${s[b]}`} data-on={b === data.band ? "true" : "false"} />
            ))}
          </div>
        </section>

        <section className={`${s.card} ${s.todayCard}`} aria-label="오늘 커피">
          {cups > 0 ? (
            <div className={s.cups} aria-hidden="true">
              {Array.from({ length: cups }, (_, i) => (
                <span key={i} className={s.cup} data-narrow={cups === 3 ? "true" : undefined}>
                  <img src="/home/cup.svg" alt="" width={16} height={16} />
                </span>
              ))}
            </div>
          ) : null}
          <div className={s.grow}>
            <Link className={s.todayLink} href="/today">
              {linkPre}<span className="mono">{data.todayCount}</span>{linkPost}
            </Link>
            <p className={s.cardSub}>{last ? HOME.lastRecord(hhmm(last.startedAt), last.label) : SAY.empty}</p>
          </div>
          <img className={s.chev} src="/home/chevron.svg" alt="" width={18} height={18} />
        </section>

        <Link className={s.already} href="/drink/select?mode=already">
          <svg aria-hidden="true" viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 1.5v9M1.5 6h9" />
          </svg>
          {BTN.alreadyDrank}
        </Link>
      </div>

      <BottomNav active="home" />
    </main>
  );
}
