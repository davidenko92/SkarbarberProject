"use client";

import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "skarbarber:pwa:dismissed-at";
const COOLDOWN_DAYS = 14;

function shouldShowAgain(): boolean {
  try {
    const last = localStorage.getItem(DISMISS_KEY);
    if (!last) return true;
    const ms = Date.now() - Number(last);
    return ms > COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function PWAInstallBridge() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const swRegistered = useRef(false);

  useEffect(() => {
    if (
      !swRegistered.current &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      swRegistered.current = true;
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // SW failed: PWA stays as plain web app. No-op.
        });
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      if (!shouldShowAgain()) return;
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      try {
        localStorage.removeItem(DISMISS_KEY);
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !deferred || isStandalone()) return null;

  async function handleInstall() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "dismissed") {
        try {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {}
      }
    } finally {
      setDeferred(null);
    }
  }

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setDeferred(null);
  }

  return (
    <div
      role="dialog"
      aria-label="Instalar Skarbarber"
      className="fixed right-3 z-30 flex items-center gap-2 rounded-full border border-gold/30 bg-black/65 py-1.5 pl-3 pr-1.5 backdrop-blur-md shadow-[0_8px_22px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,240,210,0.08)] animate-[fade-slide-in_320ms_cubic-bezier(0.22,0.8,0.2,1)_both]"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 88px)",
      }}
    >
      <button
        type="button"
        onClick={handleInstall}
        aria-label="Instalar app"
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-light transition-colors hover:text-gold"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
        <span>Instalar app</span>
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Descartar"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
      >
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      <style>{`
        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
