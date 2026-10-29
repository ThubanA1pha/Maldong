// [공통] 하단 내비게이션 (Figma 02·04 화면 공통). 초원 · 오늘 기록 · [마시기 전 확인] · 카페 · 프로필.
// 가운데 [마시기 전 확인]이 주 버튼이다. 글자는 lib/copy.ts, 아이콘은 Figma 에셋(public/nav)이며 링크 이름에 섞이지 않게 alt="".
// [카페]는 카페 앞에서 주문 전에 비교하는 흐름(F3, mode=cafe)으로 보낸다.
import Link from "next/link";
import { BTN, NAV } from "@/lib/copy";
import s from "./BottomNav.module.css";

export type NavTab = "home" | "today" | "cafe" | "profile";

function Tab({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link className={s.tab} href={href} aria-current={active ? "page" : undefined}>
      <img src={icon} alt="" width={23} height={23} />
      <span>{label}</span>
    </Link>
  );
}

export function BottomNav({ active }: { active?: NavTab }) {
  return (
    <nav className={s.nav} aria-label="화면 이동">
      <div className={s.inner}>
        <Tab href="/home" label={NAV.home} icon={active === "home" ? "/nav/home-on.svg" : "/nav/home-off.svg"} active={active === "home"} />
        <Tab href="/today" label={NAV.today} icon={active === "today" ? "/nav/today-on.svg" : "/nav/today-off.svg"} active={active === "today"} />
        <Link className={s.main} href="/drink/select?mode=before">
          <span className={s.mainIcon}><img src="/nav/center.svg" alt="" width={26} height={26} /></span>
          <span>{BTN.beforeDrink}</span>
        </Link>
        <Tab href="/drink/select?mode=cafe" label={NAV.cafe} icon="/nav/cafe.svg" active={active === "cafe"} />
        <Tab href="/profile" label={BTN.profile} icon="/nav/profile.svg" active={active === "profile"} />
      </div>
    </nav>
  );
}
