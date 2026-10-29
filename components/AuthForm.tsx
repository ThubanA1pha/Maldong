"use client";
// [공통] 가입·로그인 화면이 함께 쓰는 입력 폼. 화면 담당은 이 폼을 감싸서 배치만 바꾼다.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";

export function AuthForm({ endpoint, submitLabel, next }: { endpoint: string; submitLabel: string; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setError("이메일과 비밀번호를 모두 입력해 주세요.");
    setBusy(true); setError(null);
    try {
      await api(endpoint, { body: { email, password } });
      router.push(next);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <label className="field">이메일<input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label className="field">비밀번호<input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error ? <p className="error" role="alert">{error}</p> : null}
      <button className="btn primary" type="submit" disabled={busy}>{submitLabel}</button>
    </form>
  );
}
