/// <reference types="next" />
/// <reference types="next/image-types/global" />
// 담당: ⑦ 잘 시각 화면의 졸린 솜이. Figma 3-3(6:476)의 벡터 조각을 같은 위치에 겹친다.
import v0 from "./assets/sleepy/v0.svg";
import v1 from "./assets/sleepy/v1.svg";
import v2 from "./assets/sleepy/v2.svg";
import v3 from "./assets/sleepy/v3.svg";
import v4 from "./assets/sleepy/v4.svg";
import v5 from "./assets/sleepy/v5.svg";
import v6 from "./assets/sleepy/v6.svg";
import v7 from "./assets/sleepy/v7.svg";
import v8 from "./assets/sleepy/v8.svg";
import v9 from "./assets/sleepy/v9.svg";
import v10 from "./assets/sleepy/v10.svg";
import v11 from "./assets/sleepy/v11.svg";
import v12 from "./assets/sleepy/v12.svg";
import v13 from "./assets/sleepy/v13.svg";
import v14 from "./assets/sleepy/v14.svg";
import v15 from "./assets/sleepy/v15.svg";
import v16 from "./assets/sleepy/v16.svg";
import v17 from "./assets/sleepy/v17.svg";
import cap from "./assets/sleepy/cap.svg";
import s from "./situation.module.css";

type Src = { src: string };
// [이미지, top, right, bottom, left (%), 안쪽 여백(%) 또는 회전]
type Part = [Src, number, number, number, number, { pad?: string; rotate?: number }?];

const PARTS: Part[] = [
  [v0, 91.67, 23.33, 0.5, 23.33],
  [v1, 84.62, 54.17, 5.2, 38.33],
  [v1, 84.62, 38.33, 5.2, 54.17],
  [v2, 25.85, 22.5, 22.44, 22.5],
  [v3, 31.34, 55, 40.46, 15],
  [v4, 18.8, 33.33, 49.86, 33.33],
  [v3, 31.34, 15, 40.46, 55],
  [v5, 47.79, 62.5, 25.57, 9.17],
  [v5, 47.79, 9.17, 25.57, 62.5],
  [v3, 61.11, 53.33, 10.68, 16.67],
  [v6, 63.46, 34.17, 6.77, 34.17],
  [v3, 61.11, 16.67, 10.68, 53.33],
  [v5, 25.85, 47.5, 47.51, 24.17],
  [v5, 25.85, 24.17, 47.51, 47.5],
  [v7, 28.21, 25, 24.79, 25],
  [v8, 33.69, 57.5, 42.81, 17.5],
  [v9, 21.15, 35.83, 52.21, 35.83],
  [v8, 33.69, 17.5, 42.81, 57.5],
  [v10, 50.14, 65, 27.92, 11.67],
  [v10, 50.14, 11.67, 27.92, 65],
  [v8, 63.46, 55.83, 13.03, 19.17],
  [v11, 65.81, 36.67, 9.12, 36.67],
  [v8, 63.46, 19.17, 13.03, 55.83],
  [v10, 28.21, 50, 49.86, 26.67],
  [v10, 28.21, 26.67, 49.86, 50],
  [v12, 49, 59.23, 39.31, 22.56, { rotate: -12 }],
  [v13, 49, 22.56, 39.31, 59.23, { rotate: 12 }],
  [v14, 44.66, 34.17, 28.7, 34.17],
  [v15, 60.17, 57.5, 34.81, 34.17],
  [v15, 60.17, 34.17, 34.81, 57.5],
  [v16, 56.41, 39.17, 41.63, 39.17, { pad: "-52% -5%" }],
  [v17, 63.46, 45.83, 34.58, 45.83, { pad: "-48% -12%" }],
  [cap, 16.45, 12.5, 58.48, 30.83, { pad: "0 -1.84% -3.91% -1.84%" }],
];

export function SleepySomi() {
  return (
    <div className={s.sleepy} aria-hidden>
      {PARTS.map(([img, t, r, b, l, o], i) => (
        <span key={i} className={s.part} style={{ inset: `${t}% ${r}% ${b}% ${l}%` }}>
          {o?.rotate ? (
            <img src={img.src} alt="" className={s.rotated} style={{ transform: `translate(-50%, -50%) rotate(${o.rotate}deg)` }} />
          ) : o?.pad ? (
            <span className={s.part} style={{ inset: o.pad }}><img src={img.src} alt="" /></span>
          ) : (
            <img src={img.src} alt="" />
          )}
        </span>
      ))}
      <span className={s.z} style={{ top: "4.7%", left: "80%", fontSize: "14.667px" }}>z</span>
      <span className={s.z} style={{ top: "1.57%", left: "88.33%", fontSize: "9.167px" }}>z</span>
    </div>
  );
}
