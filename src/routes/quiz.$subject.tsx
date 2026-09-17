import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X, RotateCcw, BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getEvaluationTypes, getSubject, type Question } from "@/data/subjects";

export const Route = createFileRoute("/quiz/$subject")({
  loader: ({ params }) => {
    const subject = getSubject(params.subject);
    if (!subject) throw notFound();
    return { title: subject.title, description: subject.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "퀴즈를 찾을 수 없어요" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — KB직무퀴즈` },
        { name: "description", content: `${loaderData.description}를 한 문제씩 풀고 정답률과 해설을 확인하세요.` },
        { property: "og:title", content: `${loaderData.title} — KB직무퀴즈` },
        { property: "og:description", content: `${loaderData.description}를 한 문제씩 풀고 정답률과 해설을 확인하세요.` },
      ],
    };
  },
  component: QuizPage,
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

type SavedState = {
  order: number[];
  index: number;
  selected: number | null;
  submitted: boolean;
  correctCount: number;
  answeredCount: number;
};

function QuizPage() {
  const { subject: slug } = Route.useParams();
  const subject = getSubject(slug)!;
  const [type, setType] = useState<string>("all");
  const types = useMemo(() => getEvaluationTypes(subject), [subject]);
  const questions = useMemo(
    () =>
      type === "all"
        ? subject.questions
        : subject.questions.filter((q) => q.evaluation_type === type),
    [subject, type],
  );
  const storageKey = `quiz-progress-v1:${slug}:${type}`;
  const [orderIdx, setOrderIdx] = useState<number[]>(() => questions.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    setRestored(false);
    let saved: SavedState | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw) as SavedState;
    } catch {
      saved = null;
    }
    if (
      saved &&
      Array.isArray(saved.order) &&
      saved.order.length === questions.length &&
      saved.order.every((i) => typeof i === "number" && i >= 0 && i < questions.length)
    ) {
      setOrderIdx(saved.order);
      setIndex(saved.index ?? 0);
      setSelected(saved.selected ?? null);
      setSubmitted(Boolean(saved.submitted));
      setCorrectCount(saved.correctCount ?? 0);
      setAnsweredCount(saved.answeredCount ?? 0);
    } else {
      setOrderIdx(shuffle(questions.map((_, i) => i)));
      setIndex(0);
      setSelected(null);
      setSubmitted(false);
      setCorrectCount(0);
      setAnsweredCount(0);
    }
    setRestored(true);
  }, [storageKey, questions]);

  const order = useMemo<Question[]>(
    () => orderIdx.map((i) => questions[i]!).filter(Boolean),
    [orderIdx, questions],
  );

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          order: orderIdx,
          index,
          selected,
          submitted,
          correctCount,
          answeredCount,
        } satisfies SavedState),
      );
    } catch {
      /* ignore */
    }
  }, [restored, storageKey, orderIdx, index, selected, submitted, correctCount, answeredCount]);

  const total = order.length;
  const current = order[index];
  const finished = index >= total;

  const rate = useMemo(
    () => (answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100)),
    [correctCount, answeredCount],
  );

  const isCorrect = submitted && selected === current?.answer;

  const submit = useCallback(() => {
    if (selected === null || submitted || !current) return;
    setSubmitted(true);
    setAnsweredCount((c) => c + 1);
    if (selected === current.answer) setCorrectCount((c) => c + 1);
  }, [selected, submitted, current]);

  const next = useCallback(() => {
    setSubmitted(false);
    setSelected(null);
    setIndex((i) => i + 1);
  }, []);

  const restart = useCallback(() => {
    setOrderIdx(shuffle(questions.map((_, i) => i)));
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setCorrectCount(0);
    setAnsweredCount(0);
  }, [questions]);

  return (
    <main
      className="min-h-screen bg-background"
      style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom, 0px))" }}
    >
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
              onClick={restart}
              className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              다시 풀기
            </Button>
          </div>
          <div
            className="mt-3 -mx-5 flex gap-2 overflow-x-auto px-5 pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {["all", ...types].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  type === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "all" ? "전체" : t}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">정답 / 전체</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
                {correctCount}
                <span className="text-base font-semibold text-muted-foreground"> / {total}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium tracking-wide text-muted-foreground">현재 정답률</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-primary">{rate}%</p>
            </div>
          </div>
          <Progress
            value={total === 0 ? 0 : (Math.min(index, total) / total) * 100}
            className="mt-3 h-1.5"
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-5 pt-6">
        {finished || !current ? (
          <section className="rounded-3xl border border-border/70 bg-card p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-card-foreground">퀴즈 완료!</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              총 {total}문제 중 {correctCount}문제를 맞혔어요.
            </p>
            <p className="mt-6 text-5xl font-bold tabular-nums text-primary">{rate}%</p>
            <Button className="mt-8 w-full" size="lg" onClick={restart}>
              <RotateCcw /> 다시 풀기
            </Button>
            <Button asChild variant="outline" className="mt-3 w-full" size="lg">
              <Link to="/">다른 퀴즈 선택</Link>
            </Button>
          </section>
        ) : (
          <section>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {current.evaluation_type}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">
                {index + 1}번째 문제
              </span>
            </div>

            <h1 className="mt-4 text-lg font-semibold leading-relaxed tracking-tight text-foreground">
              {current.question}
            </h1>

            <ul className="mt-6 space-y-3">
              {current.choices.map((choice, i) => {
                const value = i + 1;
                const isPicked = selected === value;
                const isAnswer = current.answer === value;
                const showCorrect = submitted && isAnswer;
                const showWrong = submitted && isPicked && !isAnswer;
                return (
                  <li key={choice}>
                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => setSelected(value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-border bg-card px-4 py-4 text-left text-[15px] font-medium text-card-foreground transition-all active:scale-[0.99]",
                        !submitted && isPicked && "border-primary bg-accent text-accent-foreground",
                        showCorrect && "border-success bg-success-soft text-foreground",
                        showWrong && "border-danger bg-danger-soft text-foreground",
                        submitted && !showCorrect && !showWrong && "opacity-60",
                      )}
                    >
                      <span>{choice}</span>
                      {showCorrect && <Check className="size-5 shrink-0 text-success" />}
                      {showWrong && <X className="size-5 shrink-0 text-danger" />}
                    </button>
                  </li>
                );
              })}
            </ul>

            {submitted && (
              <div className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
                <p
                  className={cn(
                    "flex items-center gap-2 text-base font-bold",
                    isCorrect ? "text-success" : "text-danger",
                  )}
                >
                  {isCorrect ? <Check className="size-5" /> : <X className="size-5" />}
                  {isCorrect ? "정답입니다" : "오답입니다"}
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  정답: {current.choices[current.answer - 1]}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {current.explanation}
                </p>
                <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BookOpen className="size-3.5" /> {current.source}
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {!finished && current && (
        <div
          className="fixed inset-x-0 bottom-0 border-t border-border/60 bg-background/90 backdrop-blur-md"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div
            className="mx-auto w-full max-w-md px-5 py-4"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            {submitted ? (
              <Button className="w-full" size="lg" onClick={next}>
                {index + 1 === total ? "결과 보기" : "다음 문제"}
              </Button>
            ) : (
              <Button className="w-full" size="lg" disabled={selected === null} onClick={submit}>
                제출하기
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
