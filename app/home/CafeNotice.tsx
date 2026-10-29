"use client";
// 담당: ⑤ 홈 (F3 카페 앞 알림). 앱이 열려 있을 때만 위치를 한 번 읽는다. 권한이 없거나 실패하면 아무것도 바뀌지 않는다.
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

export function useNearCafe(): string | null {
  const [cafe, setCafe] = useState<string | null>(null);
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    let alive = true;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await api<{ cafe: { name: string } | null }>(`/api/cafes/near?lat=${coords.latitude}&lng=${coords.longitude}`);
          if (alive) setCafe(r.cafe?.name ?? null);
        } catch {
          // 위치 기능은 없어도 홈은 그대로 쓴다
        }
      },
      () => {},
      { timeout: 5000 },
    );
    return () => { alive = false; };
  }, []);
  return cafe;
}
