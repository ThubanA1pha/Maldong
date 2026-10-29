"use client";
// [공통] 가입·로그인 화면이 함께 쓰는 입력 폼. 화면 담당은 이 폼을 감싸서 배치만 바꾼다.
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/client";

export function AuthForm({ endpoint, submitLabel, next }: { endpoint: string; submitLabel: string; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const isSignup = endpoint === "/api/auth/signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    const errors: typeof fieldErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) errors.email = "이메일을 입력해 주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) errors.email = "이메일 형식을 확인해 주세요.";
    if (!password) errors.password = "비밀번호를 입력해 주세요.";
    else if (isSignup && password.length < 8) errors.password = "비밀번호는 8자 이상이어야 해요.";
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length) {
      document.getElementById(errors.email ? "email" : "password")?.focus();
      return;
    }
    submitting.current = true;
    setBusy(true); setError(null);
    try {
      await api(endpoint, { body: { email: trimmedEmail, password } });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof TypeError ? "인터넷 연결을 확인하고 다시 시도해 주세요." : err instanceof Error ? err.message : "잠시 후 다시 시도해 주세요.");
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit} noValidate aria-busy={busy}>
      <label className="field" htmlFor="email">이메일
        <input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required disabled={busy} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "email-error" : undefined} value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {fieldErrors.email ? <p id="email-error" className="error" role="alert">{fieldErrors.email}</p> : null}
      <label className="field" htmlFor="password">비밀번호
        <input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={isSignup ? 8 : undefined} disabled={busy} aria-invalid={!!fieldErrors.password} aria-describedby={fieldErrors.password ? "password-error" : isSignup ? "password-hint" : undefined} value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {fieldErrors.password ? <p id="password-error" className="error" role="alert">{fieldErrors.password}</p> : isSignup ? <p id="password-hint" className="muted">비밀번호는 8자 이상 입력해 주세요.</p> : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
      {busy ? <p role="status" className="muted">{isSignup ? "가입 정보를 저장하고 있어요." : "로그인하고 있어요."}</p> : null}
      <div className="bottom"><div><button className="btn primary" type="submit" disabled={busy}>{submitLabel}</button></div></div>
    </form>
  );
}
