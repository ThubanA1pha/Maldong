"use client";
// 담당: ⑤ 홈 (F3 카페 앞 알림). 앱이 열려 있을 때만 위치를 한 번 읽는다. 권한이 없으면 아무것도 보이지 않는다.
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Band } from "@/lib/caffeine";
import { api } from "@/lib/client";
import { BTN, SAY } from "@/lib/copy";

export function CafeNotice({ band }: { band: Band }) {
  const [cafe, setCafe] = useState<string | null>(null);
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await api<{ cafe: { name: string } | null }>(`/api/cafes/near?lat=${coords.latitude}&lng=${coords.longitude}`);
          setCafe(r.cafe?.name ?? null);
        } catch {
          // 위치 기능은 없어도 홈은 그대로 쓴다
        }
      },
      () => {},
      { timeout: 5000 },
    );
  }, []);
  if (!cafe) return null;
  return (
    <div className="card stack" data-testid="cafe-notice">
      <p style={{ margin: 0 }}>{SAY.cafe}{band === "high" ? ` ${SAY.again}` : ""}</p>
      <Link className="btn primary" href="/drink/select?mode=cafe">{BTN.cafeLook}</Link>
    </div>
  );
}
