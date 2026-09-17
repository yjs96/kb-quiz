import { useState } from "react";
import { MessageCircleQuestion, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ISSUES = [
  "과목 추가",
  "문제 추가",
  "문제 오류",
  "사이트 접속·설치 오류",
  "기능 개선 제안",
] as const;

export function ContactCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end px-5 pb-5">
      <div className="pointer-events-auto w-full max-w-md">
        {open && (
          <section className="mb-3 rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                <MessageCircleQuestion className="size-4 text-muted-foreground" />
                도움이 필요하신가요?
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2 size-8"
                onClick={() => setOpen(false)}
                aria-label="문의 안내 닫기"
              >
                <X className="size-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              아래와 같은 이슈가 발생하면 담당자에게 연락해 주세요.
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {ISSUES.map((issue) => (
                <li
                  key={issue}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  {issue}
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 rounded-xl bg-accent px-4 py-3 text-xs">
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-muted-foreground">담당자</dt>
                <dd className="font-semibold text-accent-foreground">임준수 대리</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-muted-foreground">사번</dt>
                <dd className="font-semibold tabular-nums text-accent-foreground">3903726</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-muted-foreground">연락 방법</dt>
                <dd className="font-semibold text-accent-foreground">
                  <span className="font-bold">WorKB</span>
                </dd>
              </div>
            </dl>
          </section>
        )}
        <div className="flex justify-end">
          <Button
            size="icon"
            className="size-12 rounded-full shadow-lg"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "문의 안내 닫기" : "문의 안내 열기"}
            aria-expanded={open}
          >
            {open ? (
              <X className="size-5" />
            ) : (
              <MessageCircleQuestion className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
