// [공통] 화면에서 API를 부르는 도우미. 실패하면 서버가 준 한국어 문장을 Error로 던진다.
export async function api<T = unknown>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(path, {
    method: init?.method ?? (init?.body ? "POST" : "GET"),
    headers: init?.body ? { "content-type": "application/json" } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "잠시 문제가 생겼어요. 다시 시도해 주세요.");
  return data as T;
}
