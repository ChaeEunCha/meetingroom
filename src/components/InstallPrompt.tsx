"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "meetingroom-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isMobileUA() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIosUA() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone() {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function InstallPrompt() {
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (!isMobileUA()) return;

    if (isIosUA()) {
      setMode("ios");
      return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode("android");
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setMode(null);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (!mode) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-blue-100 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="flex-1 text-sm text-gray-700">
          {mode === "ios" ? (
            <>
              <span className="font-medium">홈 화면에 추가</span>하면 앱처럼 사용할 수 있어요. 하단
              공유 버튼을 누른 뒤 &quot;홈 화면에 추가&quot;를 선택하세요.
            </>
          ) : (
            <>
              <span className="font-medium">MeetingRoom</span>을 홈 화면에 추가하고 앱처럼
              사용해보세요.
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {mode === "android" && (
            <button
              onClick={handleInstallClick}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              설치
            </button>
          )}
          <button
            onClick={dismiss}
            aria-label="닫기"
            className="rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-gray-100"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
