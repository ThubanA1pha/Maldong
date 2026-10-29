// 담당: ① 첫 화면 (F1 · S1). 로그인하지 않은 사람에게 서비스 이름과 하는 일을 보여 준다.
// 기준: Figma 01 진입 1-1. 초원 배경을 화면 아래 끝까지 채우고, 구름·해·솜이가 천천히 움직인다.
// 안내 목록(미리 보기·비교·확인)은 빼고 [시작하기]·[로그인]만 둔다.
import Link from "next/link";
import { Bubble, CharacterFace } from "@/components/Character";
import { AUTH, BTN, SERVICE_NAME } from "@/lib/copy";
import s from "./landing.module.css";

export default function Landing() {
  return (
    <main className={s.landing}>
      <div className={s.sky} aria-hidden="true">
        <img className={s.skyBg} src="/landing/sky.svg" alt="" />
        <img className={s.sun} src="/landing/sun.svg" alt="" width={80} height={80} />
        <img className={`${s.cloud} ${s.cloudA}`} src="/landing/cloud-a.svg" alt="" width={76} height={34} />
        <img className={`${s.cloud} ${s.cloudB}`} src="/landing/cloud-b.svg" alt="" width={56} height={26} />
        <img className={`${s.cloud} ${s.cloudC}`} src="/landing/cloud-a.svg" alt="" width={57} height={26} />
      </div>

      <header className={s.brand}>
        <img src="/character/head-lg.svg" alt="" width={49} height={46} />
        <h1 className={s.name}>{SERVICE_NAME}</h1>
        <p className={s.tagline}>{AUTH.landingTagline}</p>
      </header>

      <div className={s.ground}>
        <img className={s.groundBg} src="/landing/ground.svg" alt="" />
        <div className={s.somi}>
          <div className={s.bubble}><Bubble>{AUTH.landingLine}</Bubble></div>
          <div className={s.wave}>
            <CharacterFace band="ok" mood="wave" size={170} />
          </div>
        </div>
      </div>

      <div className={s.actions}>
        <Link className="btn primary" href="/signup">{BTN.start}</Link>
        <Link className="btn" href="/login">{BTN.login}</Link>
      </div>
    </main>
  );
}
