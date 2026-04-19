import {
  BadgeCheck,
  CircleX,
  Target,
  ArrowRightCircle,
} from "lucide-react";
import { ReviewResponse } from "@/types/quiz";

type Props = {
  data: ReviewResponse;
};

export default function ReviewCard({ data }: Props) {
  const correctCount = data.items.filter((item) => item.isCorrect).length;
  const wrongCount = data.items.filter((item) => !item.isCorrect).length;
  const accuracy = Math.round((data.score / data.total) * 100);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-900/60 backdrop-blur border border-slate-700 p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Review
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            Here’s what you should revise next
          </h2>
        </div>

        <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Score: {data.score}/{data.total}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <BadgeCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">Correct</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{correctCount}</p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-700">
            <CircleX className="h-4 w-4" />
            <span className="text-sm font-semibold">Incorrect</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{wrongCount}</p>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <Target className="h-4 w-4" />
            <span className="text-sm font-semibold">Accuracy</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{accuracy}%</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Performance Summary</h3>
        <p className="mt-3 text-sm leading-7 text-slate-700">{data.summary}</p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-900">Weak Areas</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
            {data.weakAreas.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
          <div className="flex items-center gap-2">
            <ArrowRightCircle className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              What to Revise Next
            </h3>
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
            {data.reviseNext.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {data.items.map((item, index) => (
          <div
            key={index}
            className={`rounded-2xl border p-5 ${
              item.isCorrect
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <p className="font-semibold leading-7 text-slate-900">
                Q{index + 1}. {item.question}
              </p>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  item.isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-700/80 p-4 text-sm">
                <p className="font-semibold text-slate-900">Your answer</p>
                <p
                  className={`mt-2 leading-6 ${
                    item.isCorrect
                      ? "font-medium text-green-700"
                      : "font-medium text-red-700"
                  }`}
                >
                  {item.selectedAnswer || "Not answered"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-700/80 p-4 text-sm">
                <p className="font-semibold text-slate-900">Correct answer</p>
                <p className="mt-2 font-medium leading-6 text-green-700">
                  {item.correctAnswer}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-900/60 backdrop-blur border border-slate-700/80 p-4">
              <p className="text-sm leading-7 text-slate-700">{item.feedback}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}