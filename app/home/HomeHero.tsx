"use client";
// 담당: ⑤ 홈 (F3·F5). Figma 02 초원 홈 2-1~2-4: 초원 위를 솜이가 좌우로 걷고(방향 바꿀 때 좌우 반전), 머리 위 말풍선으로 말을 건다.
// 카페 50m 안이면 솜이가 먼저 "카페 앞이네?"라고 말하고 [뭐 마실지 볼래] / [괜찮아]를 보여 준다(S4).
import Link from "next/link";
import { useState } from "react";
import { Bubble, CharacterFace } from "@/components/Character";
import type { Band } from "@/lib/caffeine";
import { BTN, HOME, SAY } from "@/lib/copy";
import { useNearCafe } from "./CafeNotice";
import s from "./home.module.css";

export type Scene = "day" | "night";

export function HomeHero({ band, line, scene, title }: { band: Band; line: string; scene: Scene; title: string }) {
  const cafe = useNearCafe();
  const [dismissed, setDismissed] = useState(false);
  const showCafe = !!cafe && !dismissed;
  const cafeLine = band === "high" ? `${SAY.cafe} ${SAY.again}` : `${SAY.cafe}\n${SAY.cafeAsk}`;
  const face: Band = showCafe && band === "ok" ? "mid" : band; // 카페 앞에서는 멈칫하며 말을 건다

  return (
    <section className={`${s.hero} ${s[scene]}`} aria-label="초원" data-cafe={showCafe ? "true" : undefined}>
      <img className={s.bg} src={scene === "day" ? "/home/day.svg" : "/home/night.svg"} alt="" />

      <header className={s.top}>
        <img src={scene === "day" ? "/character/head.svg" : "/character/head-night.svg"} alt="" width={23} height={21} />
        <span className={s.logo}>{title}</span>
      </header>

      {showCafe ? (
        <p className={s.badge}>
          <img src="/home/pin.svg" alt="" width={14} height={14} />
          {HOME.cafeNear(cafe)}
        </p>
      ) : band === "high" ? (
        <p className={s.sheepCount}>
          <img src="/character/head-night.svg" alt="" width={14} height={13} />
          <span className="mono">{HOME.sheepCount}</span>
        </p>
      ) : null}

      <div className={s.talk} data-testid={showCafe ? "cafe-notice" : undefined}>
        <Bubble>{showCafe ? cafeLine : line}</Bubble>
        {showCafe ? (
          <div className={s.cafeBtns}>
            <Link className={s.cafeGo} href="/drink/select?mode=cafe">{BTN.cafeLook}</Link>
            <button className={s.cafeNo} type="button" onClick={() => setDismissed(true)}>{BTN.cafeDismiss}</button>
          </div>
        ) : null}
      </div>

      <div className={s.walker}>
        <div className={s.facing}>
          <div className={s.breathe}>
            <CharacterFace band={band} mood={face} />
          </div>
        </div>
      </div>
    </section>
  );
}
