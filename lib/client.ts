// [공통] 화면에서 API를 부르는 도우미. 실패하면 서버가 준 한국어 문장을 Error로 던진다.
import { ERROR_SAY } from "./copy";

export async function api<T = unknown>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init?.method ?? (init?.body ? "POST" : "GET"),
      headers: init?.body ? { "content-type": "application/json" } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new Error(ERROR_SAY.offline);
  }
  const data = await res.json().catch(() => { throw new Error(ERROR_SAY.general); });
  if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : ERROR_SAY.general);
  return data as T;
}
