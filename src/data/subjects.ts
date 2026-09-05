import financeMarketing from "./finance-marketing.json";
import fintech from "./fintech.json";

export type Question = {
  evaluation_type: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  source: string;
};

export type Subject = {
  slug: string;
  title: string;
  description: string;
  questions: Question[];
};

export const subjects: Subject[] = [
  {
    slug: "finance-marketing",
    title: "금융마케팅",
    description: "2026년 8월 2일 시험",
    questions: financeMarketing as Question[],
  },
  {
    slug: "fintech",
    title: "핀테크/디지털마케팅",
    description: "2026년 9월 6일 시험",
    questions: fintech as Question[],
  },
];

export function getSubject(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}
