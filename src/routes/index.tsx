import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, BookOpen } from "lucide-react";
import { subjects } from "@/data/subjects";
import { Button } from "@/components/ui/button";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ContactCard } from "@/components/ContactCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KB직무퀴즈 — 과목별 문제 풀이" },
      {
        name: "description",
        content: "KB직무퀴즈에서 금융마케팅, 핀테크/디지털마케팅 등 과목을 골라 랜덤 문제를 한 문제씩 풀어보세요.",
      },
      { property: "og:title", content: "KB직무퀴즈 — 과목별 문제 풀이" },
      {
        property: "og:description",
        content: "KB직무퀴즈에서 금융마케팅, 핀테크/디지털마케팅 등 과목을 골라 랜덤 문제를 한 문제씩 풀어보세요.",
      },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  return (
    <>
      <PWAInstallPrompt />
      <main className="min-h-screen bg-background pt-16">
        <div className="mx-auto w-full max-w-md px-5 py-6 pb-20">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">KB직무퀴즈</h1>
          <p className="mt-2 text-sm text-muted-foreground">풀고 싶은 과목을 선택하세요.</p>


        <ul className="mt-8 space-y-3">
          {subjects.map((s) => (
            <li
              key={s.slug}
              className="rounded-2xl border-2 border-border bg-card px-5 py-5"
            >
              <span className="block text-base font-semibold text-card-foreground">
                {s.title}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {s.description} · {s.questions.length}문제
              </span>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button asChild>
                  <Link to="/quiz/$subject" params={{ subject: s.slug }}>
                    <ClipboardList className="size-4" /> 퀴즈 풀기
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/study/$subject" params={{ subject: s.slug }}>
                    <BookOpen className="size-4" /> 학습하기
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <ContactCard />
      </div>
    </main>
    </>
  );
}
