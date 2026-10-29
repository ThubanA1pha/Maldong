// [공통] 화면 머리 부품. 새 화면은 이걸 가져다 쓰고 장면·말풍선을 새로 그리지 않는다.
// - Scene: 밤하늘(night)·낮 초원(day) 그림 위에 로고, 말풍선, 솜이를 얹는다. 높이는 화면이 정한다.
// - TopBar: 뒤로 가기(링크) + 가운데 제목.
import Link from "next/link";
import type { Band } from "@/lib/caffeine";
import { SERVICE_NAME } from "@/lib/copy";
import { Bubble, CharacterFace, type Mood } from "./Character";
import s from "./Scene.module.css";

export function Scene({ scene = "night", height = 300, band = "ok", mood, line, logo = true, anchor = "center" }: {
  scene?: "night" | "day"; height?: number; band?: Band; mood?: Mood; line?: string | null; logo?: boolean;
  /** 그림을 자를 기준. 장면이 낮을 때 "bottom"이면 땅·솜이 쪽이 보인다 */ anchor?: "top" | "center" | "bottom";
}) {
  return (
    <section className={`${s.scene} ${scene === "day" ? s.day : ""}`} style={{ height }} aria-label={scene === "day" ? "낮 초원" : "밤 초원"}>
      <img className={s.bg} style={{ objectPosition: `center ${anchor}` }} src={scene === "day" ? "/home/day.svg" : "/home/night.svg"} alt="" />
      {logo ? (
        <p className={s.logo}>
          <img src={scene === "day" ? "/character/head.svg" : "/character/head-night.svg"} alt="" width={23} height={21} />
          {SERVICE_NAME}
        </p>
      ) : null}
      <div className={s.talk}>
        {line ? <Bubble>{line}</Bubble> : <span />}
        <CharacterFace band={band} mood={mood} size={112} />
      </div>
    </section>
  );
}

export function TopBar({ title, back }: { title: string; back?: string }) {
  return (
    <header className={s.bar}>
      {back ? <Link className={s.back} href={back} aria-label="뒤로 가기">‹</Link> : <span />}
      <h1 className={s.barTitle}>{title}</h1>
      <span />
    </header>
  );
}
