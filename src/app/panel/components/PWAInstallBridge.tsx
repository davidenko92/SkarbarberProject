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

function detectIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS =
    ua.includes("Mac") && "ontouchend" in document;
  return isIOS || isIPadOS;
}

export function PWAInstallBridge() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [hidden, setHidden] = useState(false);
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

    setIsIOS(detectIOS());

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

  if (installed || isStandalone() || hidden) return null;

  // Chrome/Android nativo
  const hasNative = !!deferred;
  // iOS: Safari no soporta beforeinstallprompt, pero sí "Añadir a pantalla de inicio"
  const showIOS = !hasNative && isIOS && shouldShowAgain();

  if (!hasNative && !showIOS) return null;

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
    setShowIOSHelp(false);
    setHidden(true);
  }

  return (
    <>
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
          onClick={hasNative ? handleInstall : () => setShowIOSHelp(true)}
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
      </div>

      {showIOSHelp && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm px-4 pb-8 pt-16 sm:items-center"
          onClick={() => setShowIOSHelp(false)}
        >
          <div
            role="dialog"
            aria-label="Cómo instalar en iPhone"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-gold/30 bg-[#0a0a0a] p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,240,210,0.08)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-gold-light">
                  Instalar en iPhone
                </p>
                <h2 className="mt-2 font-serif text-[24px] leading-tight text-white">
                  3 pasos en <em className="text-gold not-italic">Safari</em>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSHelp(false)}
                aria-label="Cerrar"
                className="-mr-2 -mt-2 flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:bg-white/5 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <ol className="mt-5 space-y-4 text-sm text-white/85">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 text-[11px] font-semibold text-gold-light">
                  1
                </span>
                <span>
                  Abre esta página en{" "}
                  <strong className="text-white">Safari</strong> (no Chrome).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 text-[11px] font-semibold text-gold-light">
                  2
                </span>
                <span className="flex items-center gap-2">
                  Pulsa el botón de
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2 py-0.5 text-xs">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v12" />
                      <path d="m7 8 5-5 5 5" />
                      <path d="M5 21h14" />
                    </svg>
                    Compartir
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 text-[11px] font-semibold text-gold-light">
                  3
                </span>
                <span>
                  Elige{" "}
                  <strong className="text-white">
                    “Añadir a pantalla de inicio”
                  </strong>
                  .
                </span>
              </li>
            </ol>

            <p className="mt-5 text-xs text-white/45">
              Verás el icono dorado de Skarbarber junto a tus apps.
            </p>

            <button
              type="button"
              onClick={() => setShowIOSHelp(false)}
              className="mt-5 w-full rounded-full bg-gradient-to-b from-[#e5c171] via-[#c4a462] to-[#aa842a] py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black shadow-[0_8px_22px_-10px_rgba(229,193,113,0.6)] active:scale-[0.98] transition-transform"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
