import { useEffect, useState } from "react";
import { Download, X, Share2, PlusSquare } from "lucide-react";

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 이미 PWA로 실행 중이면 표시하지 않음
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS standalone property
      window.navigator.standalone === true;
    if (isStandalone) return;

    // 닫기 기록 확인
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = Number(dismissed);
      if (!Number.isNaN(dismissedAt)) {
        const elapsedDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
        if (elapsedDays < DISMISS_DAYS) return;
      }
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS Safari는 beforeinstallprompt를 지원하지 않으므로, 별도 안내 배너 표시
    if (iOS && !deferredPrompt) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSModal(true);
      }
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.removeItem(DISMISS_KEY);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary">
              <Download className="size-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">KB직무퀴즈를 앱처럼 사용해보세요</p>
              <p className="text-xs text-muted-foreground">
                {isIOS ? "홈 화면에 추가하면 더 빠르게 시작할 수 있어요" : "홈 화면에 추가하면 오프라인에서도 바로 열 수 있어요"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={handleInstall}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {isIOS ? "설치 방법" : "설치하기"}
            </button>
            <button
              onClick={handleDismiss}
              aria-label="닫기"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-lg">
            <h3 className="text-base font-semibold text-card-foreground">iOS에서 설치하기</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Safari 주소창 아래의 <Share2 className="mx-1 inline size-4" /> 공유 버튼을 누르고,{" "}
              <PlusSquare className="mx-1 inline size-4" />
              "홈 화면에 추가"를 선택하면 앱 아이콘이 생겨요.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowIOSModal(false)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
