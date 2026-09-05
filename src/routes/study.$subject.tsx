import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, ChevronDown, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSubject } from "@/data/subjects";

export const Route = createFileRoute("/study/$subject")({
  loader: ({ params }) => {
    const subject = getSubject(params.subject);
    if (!subject) throw notFound();
    return { title: subject.title, description: subject.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "학습 자료를 찾을 수 없어요" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} 학습하기 — KB직무퀴즈`;
    const description = `${loaderData.description}의 모든 문제와 정답, 해설을 한 화면에서 훑어보세요.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: StudyPage,
});

function StudyPage() {
  const { subject: slug } = Route.useParams();
  const subject = getSubject(slug)!;
  const questions = subject.questions;

  const [open, setOpen] = useState<Set<number>>(() => new Set());

  const PAGE = 12;
  const [visible, setVisible] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible(PAGE);
  }, [slug]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visible >= questions.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible((v) => Math.min(v + PAGE, questions.length));
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, questions.length]);

  const allOpen = open.size === questions.length;

  const toggleAll = () => {
    setOpen(allOpen ? new Set() : new Set(questions.map((_, i) => i)));
  };

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-md px-5 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" /> {subject.title}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={cn("size-3.5 transition-transform", allOpen && "rotate-180")} />
              {allOpen ? "전체 정답·해설 접기" : "전체 정답·해설 보기"}
            </Button>
          </div>
          <div className="mt-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">학습하기</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">총 {questions.length}문제</p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md space-y-4 px-5 pt-6">
        {questions.slice(0, visible).map((q, i) => {
          const isOpen = open.has(i);
          return (
            <section key={i} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {q.evaluation_type}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">{i + 1}번</span>
              </div>

              <h2 className="mt-3 text-[15px] font-semibold leading-relaxed text-card-foreground">
                {q.question}
              </h2>

              <ul className="mt-4 space-y-2">
                {q.choices.map((choice, ci) => {
                  const isAnswer = q.answer === ci + 1;
                  return (
                    <li
                      key={choice}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm text-card-foreground",
                        isOpen && isAnswer && "border-success bg-success-soft font-semibold",
                        isOpen && !isAnswer && "opacity-60",
                      )}
                    >
                      <span>{choice}</span>
                      {isOpen && isAnswer && <Check className="size-4 shrink-0 text-success" />}
                    </li>
                  );
                })}
              </ul>

              {isOpen ? (
                <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    정답: {q.choices[q.answer - 1]}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <BookOpen className="size-3.5" /> {q.source}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggle(i)}
                    className="mt-3 h-8 w-full text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    접기
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => toggle(i)}
                >
                  정답·해설 보기
                </Button>
              )}
            </section>
          );
        })}

        <div ref={sentinelRef} aria-hidden className="h-px" />

        <p className="pt-2 text-center text-xs text-muted-foreground">
          {visible < questions.length
            ? `${visible} / ${questions.length}문제 불러오는 중…`
            : `${questions.length}문제를 모두 확인했어요`}
        </p>
      </div>
    </main>
  );
}
