"use client";

import { Brain, CircleHelp } from "lucide-react";
import { QuizQuestion } from "@/types/quiz";

type Props = {
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
};

export default function QuizCard({
  questions,
  userAnswers,
  setUserAnswers,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-900/60 backdrop-blur border border-slate-700 p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Quiz
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            Test your understanding
          </h2>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
          <Brain className="h-4 w-4" />
          {Object.keys(userAnswers).length}/{questions.length} answered
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {questions.map((q, index) => {
          const selectedAnswer = userAnswers[index];

          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-slate-900/60 backdrop-blur border border-slate-700 p-2 shadow-sm">
                  <CircleHelp className="h-4 w-4 text-slate-700" />
                </div>

                <div className="flex-1">
                  <p className="text-base font-semibold leading-7 text-slate-900">
                    Q{index + 1}. {q.question}
                  </p>

                  <div className="mt-4 grid gap-3">
                    {q.options.map((option) => {
                      const isSelected = selectedAnswer === option;

                      return (
                        <label
                          key={option}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition ${
                            isSelected
                              ? "border-indigo-300 bg-indigo-50 shadow-sm"
                              : "border-slate-200 bg-slate-900/60 backdrop-blur border border-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={isSelected}
                            onChange={() =>
                              setUserAnswers((prev) => ({
                                ...prev,
                                [index]: option,
                              }))
                            }
                            className="mt-1"
                          />
                          <span
                            className={`leading-6 ${
                              isSelected
                                ? "font-medium text-indigo-700"
                                : "text-slate-700"
                            }`}
                          >
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}