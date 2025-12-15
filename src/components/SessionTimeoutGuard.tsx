"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearAuthToken, getAuthToken } from "@/lib/session";

const SESSION_DURATION_MS = 25 * 60 * 1000; // 25 minutes
const WARNING_DURATION_MS = 2 * 60 * 1000; // warn 2 minutes before

export function SessionTimeoutGuard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState<number>(Math.round(WARNING_DURATION_MS / 1000));
  const lastActiveRef = useRef<number>(Date.now());
  const warnTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect token changes
  useEffect(() => {
    setToken(getAuthToken());
  }, []);

  const clearTimers = () => {
    if (warnTimeout.current) {
      clearTimeout(warnTimeout.current);
      warnTimeout.current = null;
    }
    if (logoutTimeout.current) {
      clearTimeout(logoutTimeout.current);
      logoutTimeout.current = null;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  };

  const handleLogout = useCallback(() => {
    clearTimers();
    clearAuthToken();
    setToken(null);
    setShowWarning(false);
    router.replace("/login");
  }, [router]);

  const startCountdown = useCallback(() => {
    setCountdown(Math.round(WARNING_DURATION_MS / 1000));
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current || undefined);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleLogout]);

  const scheduleTimers = useCallback(() => {
    clearTimers();
    const remaining = SESSION_DURATION_MS - (Date.now() - lastActiveRef.current);
    if (remaining <= 0) {
      handleLogout();
      return;
    }
    const warnIn = Math.max(0, remaining - WARNING_DURATION_MS);
    warnTimeout.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warnIn);
    logoutTimeout.current = setTimeout(() => {
      handleLogout();
    }, remaining);
  }, [handleLogout, startCountdown]);

  const markActivity = useCallback(() => {
    lastActiveRef.current = Date.now();
    if (showWarning) setShowWarning(false);
    scheduleTimers();
  }, [scheduleTimers, showWarning]);

  // Attach activity listeners
  useEffect(() => {
    if (!token) return;
    const events: Array<keyof DocumentEventMap> = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "visibilitychange"];
    events.forEach((evt) => document.addEventListener(evt, markActivity));
    scheduleTimers();
    return () => {
      events.forEach((evt) => document.removeEventListener(evt, markActivity));
      clearTimers();
    };
  }, [token, markActivity, scheduleTimers]);

  // If user logs out elsewhere, stop
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getAuthToken();
      if (!current && token) {
        handleLogout();
      }
      if (current !== token) {
        setToken(current);
        lastActiveRef.current = Date.now();
        scheduleTimers();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [token, handleLogout, scheduleTimers]);

  const secondsMessage = useMemo(() => {
    if (countdown <= 0) return "";
    if (countdown <= 60) return `${countdown}s`;
    const mins = Math.floor(countdown / 60);
    const secs = countdown % 60;
    return `${mins}m ${secs}s`;
  }, [countdown]);

  if (!token) return null;

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-2xl border border-white/15 bg-[#0b1224] p-5 text-white shadow-2xl shadow-black/40">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Sesión</p>
            <h3 className="mt-2 text-xl font-semibold">Tu sesión está por expirar</h3>
            <p className="mt-2 text-sm text-white/80">Por seguridad, la sesión se cerrará automáticamente si no confirmas.</p>
            <p className="mt-3 text-sm font-semibold text-amber-200">Tiempo restante: {secondsMessage}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={markActivity}
                className="rounded-lg border border-emerald-200/50 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:-translate-y-[1px] hover:border-emerald-100/80"
              >
                Continuar en sesión
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40"
              >
                Cerrar ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
