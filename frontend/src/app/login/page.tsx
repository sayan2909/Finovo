"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Wallet, Eye, EyeOff, Clock, ArrowRight, Mail, Lock, Shield, AlertCircle, X, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Field, inputCls } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isOtpFocused, setIsOtpFocused] = useState(true);
  const [cooldown, setCooldown] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Sign In · Finovo";
    setEmail("");
    setPassword("");
    if (formRef.current) formRef.current.reset();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const reason = params.get("reason");
      if (reason === "timeout" || reason === "exit_timeout") setIsTimeout(true);
    }
  }, []);

  // Live countdown timer for rate limit lockout (capped at 20 seconds)
  useEffect(() => {
    if (cooldown === null || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setErr("");
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.requires2FA) {
        setStep("2fa");
        setLoading(false);
        setTwoFactorCode("");
        setTimeout(() => otpInputRef.current?.focus(), 100);
        return;
      }
      router.push("/dashboard");
    } catch (e2: unknown) {
      const msg = e2 instanceof Error ? e2.message : "Invalid credentials";
      setErr(msg);
      setLoading(false);
      const match = msg.match(/wait\s+(\d+)\s*(?:seconds|s)?/i);
      if (match) {
        setCooldown(Math.min(20, Math.max(1, parseInt(match[1], 10))));
      } else {
        setCooldown(null);
      }
    }
  };

  const [resetting2FA, setResetting2FA] = useState(false);

  const handleEmergencyReset2FA = async () => {
    setErr("");
    setResetting2FA(true);
    try {
      const res = await fetch("/api/auth/2fa/reset-emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset 2FA");
      }
      await login(email, password);
      router.push("/dashboard");
    } catch (e2: unknown) {
      const msg = e2 instanceof Error ? e2.message : "Unable to reset 2FA";
      setErr(msg);
      setResetting2FA(false);
    }
  };

  const handle2FASubmit = async (e?: React.FormEvent, codeToVerify?: string) => {
    if (e) e.preventDefault();
    const code = codeToVerify || twoFactorCode;
    if (code.trim().length < 6) {
      setErr("Please enter the complete 6-digit code.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      await login(email, password, code.trim());
      router.push("/dashboard");
    } catch (e2: unknown) {
      const msg = e2 instanceof Error ? e2.message : "Invalid verification code";
      setErr(msg);
      setLoading(false);
      const match = msg.match(/wait\s+(\d+)\s*(?:seconds|s)?/i);
      if (match) {
        setCooldown(Math.min(20, Math.max(1, parseInt(match[1], 10))));
      } else {
        setCooldown(null);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0b0e11] overflow-hidden">

      {/* Left decorative panel (Desktop) */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between overflow-hidden bg-[#111419] border-r border-slate-200 dark:border-white/[0.08] p-10 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-slate-50 dark:bg-white/[0.04] blur-2xl" />
        </div>

        <Link href="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white/10 dark:text-white dark:border dark:border-white/10 font-bold shadow-lg shadow-xs">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Finovo</span>
        </Link>

        <div className="relative">
          <h2 className="text-4xl xl:text-5xl font-black leading-[1.08] tracking-tight">
            Welcome back.<br />
            <span className="text-white/80">Your money missed you.</span>
          </h2>
          <p className="mt-4 max-w-sm text-slate-400 leading-relaxed text-base">
            Pick up where you left off — budgets, goals and insights are waiting.
          </p>
        </div>

        <p className="relative text-sm text-slate-500">© 2026 Finovo · Take Control of Your Money.</p>
      </div>

      {/* Right panel (Mobile & Desktop Form) */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0b0e11]">

        {/* Ambient Visual Atmosphere */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-28 -right-28 h-[360px] w-[360px] sm:h-[460px] sm:w-[460px] rounded-full bg-gradient-to-br from-emerald-500/10 via-slate-500/5 to-transparent blur-3xl" style={{ animationDuration: "7s" }} />
          <div className="absolute -bottom-28 -left-28 h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-slate-500/5 to-transparent blur-3xl" style={{ animationDuration: "9s" }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]" />
        </div>

        {/* Mobile header */}
        <div className="relative z-10 flex items-center px-6 pt-7 pb-2 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white/10 dark:text-white dark:border dark:border-white/10 font-bold shadow-md shadow-xs">
              <Wallet className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">Finovo</span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">

            {/* Main Auth Card */}
            <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-2xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#15181d]/90 sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {step === "2fa" ? "Two-Factor Authentication" : "Sign in"}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {step === "2fa"
                    ? "Enter the 6-digit code generated by your authenticator app"
                    : "Welcome back to Finovo"}
                </p>
              </div>

              {isTimeout && (
                <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300">
                  <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Session expired. Please sign in again.</span>
                </div>
              )}
              {err && (
                <div className="mb-5 relative overflow-hidden rounded-2xl border border-rose-500/25 bg-gradient-to-r from-rose-500/[0.09] via-rose-500/[0.04] to-transparent p-4 dark:border-rose-500/20 dark:bg-[#1a1215]/90 backdrop-blur-md shadow-lg shadow-rose-950/10 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 mt-0.5">
                      <AlertCircle className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                          {cooldown !== null ? "Sign-in Cooldown Active" : "Authentication Notice"}
                        </p>
                        {cooldown !== null && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-mono font-bold text-rose-600 dark:text-rose-300">
                            <Clock className="h-3 w-3 animate-spin" />
                            {cooldown}s
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-rose-800/90 dark:text-rose-200/90 leading-relaxed font-medium">
                        {cooldown !== null ? (
                          <>
                            Too many attempts. You can try again in{" "}
                            <span className="font-bold text-rose-900 dark:text-white underline decoration-rose-500/40 underline-offset-2">
                              {cooldown} second{cooldown !== 1 ? "s" : ""}
                            </span>
                            .
                          </>
                        ) : (
                          err
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setErr("");
                        setCooldown(null);
                      }}
                      className="shrink-0 -mr-1 -mt-1 rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-200 transition-colors cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {cooldown !== null && (
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-rose-500/10 dark:bg-white/[0.08]">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-1000 ease-linear rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, (cooldown / 20) * 100))}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {step === "2fa" ? (
                /* ── STEP 2: 2FA CHALLENGE SCREEN ── */
                <form onSubmit={handle2FASubmit} className="space-y-5">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/[0.08] dark:bg-[#181c23] flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/80 text-slate-800 dark:bg-white/[0.08] dark:text-white">
                      <Shield className="h-5 w-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">Authenticator Verification</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{email}</p>
                    </div>
                  </div>

                  {/* 6 High-Contrast OTP Digit Cells with • placeholder */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center">
                      Security Code
                    </label>

                    <div className="relative cursor-text" onClick={() => otpInputRef.current?.focus()}>
                      <input
                        ref={otpInputRef}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={twoFactorCode}
                        onFocus={() => setIsOtpFocused(true)}
                        onBlur={() => setIsOtpFocused(false)}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setTwoFactorCode(val);
                          setErr("");
                          if (val.length === 6) {
                            handle2FASubmit(undefined, val);
                          }
                        }}
                        className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer text-transparent selection:bg-transparent"
                        autoFocus
                      />

                      <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                        {[0, 1, 2, 3, 4, 5].map((index) => {
                          const digit = twoFactorCode[index];
                          const isCurrent = twoFactorCode.length === index;
                          return (
                            <div
                              key={index}
                              className={`relative flex h-12 w-10 sm:h-14 sm:w-12 items-center justify-center rounded-2xl border text-xl font-mono font-bold transition-all ${
                                digit
                                  ? "border-slate-400 bg-white text-slate-900 dark:border-white/30 dark:bg-[#1c212a] dark:text-white shadow-xs"
                                  : isCurrent && isOtpFocused
                                  ? "border-slate-400 bg-white dark:border-white/40 dark:bg-[#181c23] text-slate-900 dark:text-white ring-1 ring-slate-300 dark:ring-white/10"
                                  : "border-slate-200/90 bg-slate-50/80 text-slate-400 dark:border-white/[0.08] dark:bg-[#1a1e24]"
                              }`}
                            >
                              {digit ? (
                                <span>{digit}</span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 text-sm font-sans">•</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                      Open Google Authenticator, Microsoft Authenticator, or 1Password to view your 6-digit token.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      type="submit"
                      loading={loading}
                      disabled={twoFactorCode.length < 6}
                      className="w-full py-3.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <span>Verify & Sign In</span>
                      <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep("credentials");
                        setTwoFactorCode("");
                        setErr("");
                      }}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer text-center"
                    >
                      ← Back to password sign in
                    </button>

                    <div className="pt-3 mt-1 border-t border-slate-100 dark:border-white/[0.06] text-center">
                      <button
                        type="button"
                        onClick={handleEmergencyReset2FA}
                        disabled={resetting2FA}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition cursor-pointer"
                      >
                        {resetting2FA ? "Resetting 2FA..." : "Lost authenticator? Reset & Sign In"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* ── STEP 1: EMAIL & PASSWORD FORM ── */
                <form ref={formRef} onSubmit={handleCredentialsSubmit} autoComplete="off" className="space-y-4">
                  <Field label="Email">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        className={`${inputCls} pl-10`}
                        type="email"
                        name="fintrack_login_email"
                        autoComplete="off"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                  </Field>
                  <Field label="Password">
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        className={`${inputCls} pl-10 pr-11`}
                        type={show ? "text" : "password"}
                        name="fintrack_login_password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-xs font-semibold text-slate-900 hover:underline dark:text-emerald-400 transition">
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full py-3.5 text-sm font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 shadow-lg shadow-xs rounded-2xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </form>
              )}
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No account?{" "}
              <Link href="/register" className="font-bold text-slate-900 hover:underline dark:text-emerald-400 transition">
                Create one free
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
