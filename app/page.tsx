"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  ClipboardCheck,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react";
import ExplanationCard from "@/components/ExplanationCard";
import QuizCard from "@/components/QuizCard";
import ReviewCard from "@/components/ReviewCard";
import {
  ExplanationResponse,
  QuizResponse,
  ReviewResponse,
} from "@/types/quiz";

export default function HomePage() {
  const [notes, setNotes] = useState("");
  const [submittedNotes, setSubmittedNotes] = useState("");
  const [loading, setLoading] = useState<"explain" | "quiz" | "review" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(
    null
  );
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  const answeredCount = useMemo(
    () => Object.keys(userAnswers).length,
    [userAnswers]
  );

  async function handleExplain() {
    try {
      setLoading("explain");
      setError(null);
      setReview(null);
      setSubmittedNotes(notes);

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to explain notes.");
      }

      setExplanation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerateQuiz() {
    try {
      setLoading("quiz");
      setError(null);
      setReview(null);
      setUserAnswers({});
      setSubmittedNotes(notes);

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quiz.");
      }

      setQuiz(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function handleReview() {
    if (!quiz) return;

    try {
      setLoading("review");
      setError(null);

      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: quiz.questions,
          userAnswers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to review answers.");
      }

      setReview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  function resetSession() {
    setNotes("");
    setSubmittedNotes("");
    setError(null);
    setExplanation(null);
    setQuiz(null);
    setReview(null);
    setUserAnswers({});
    setLoading(null);
  }

  return (
    <main className="flex min-h-screen bg-[#f7f7f8] text-slate-900">
      <aside className="hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 p-4">
          <button
            onClick={resetSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            New session
          </button>
        </div>

        <div className="p-4">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold">Prep4Exam</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              A study coach that turns notes into explanation, quiz, and review.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <BookOpen className="h-4 w-4" />
                Understand
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Simple explanation from raw notes
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Brain className="h-4 w-4" />
                Practice
              </div>
              <p className="mt-1 text-sm text-slate-600">
                AI-generated MCQs for active recall
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ClipboardCheck className="h-4 w-4" />
                Improve
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Review mistakes and revise next steps
              </p>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
            <div className="rounded-xl bg-slate-950 p-2 text-white">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold sm:text-base">Prep4Exam</h1>
              <p className="text-xs text-slate-500">
                Chat-style AI study coach
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
            {!submittedNotes && !loading && (
              <div className="mx-auto mt-10 max-w-2xl text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                  How can I help you study today?
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Paste your notes, then generate an explanation, quiz, or answer
                  review in a conversation-style interface.
                </p>

                <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Explain a topic
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Turn notes into simple revision-ready explanation.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Generate a quiz
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Create MCQs that test understanding.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Review mistakes
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      See what went wrong and what to revise next.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submittedNotes && (
              <div className="ml-auto w-full max-w-2xl rounded-3xl bg-slate-900 px-5 py-4 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  You
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                  {submittedNotes}
                </p>
              </div>
            )}

            {error && (
              <div className="w-full max-w-3xl rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading && (
              <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Prep4Exam
                </p>
                <div className="mt-4 space-y-3 animate-pulse">
                  <div className="h-4 w-40 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-5/6 rounded bg-slate-100" />
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  {loading === "explain" && "Generating explanation..."}
                  {loading === "quiz" && "Generating quiz..."}
                  {loading === "review" && "Reviewing your answers..."}
                </p>
              </div>
            )}

            {explanation && !loading && (
              <div className="w-full max-w-3xl">
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                  <div className="rounded-xl bg-white p-2 shadow-sm">
                    <Sparkles className="h-4 w-4 text-slate-700" />
                  </div>
                  Prep4Exam
                </div>
                <ExplanationCard data={explanation} />
              </div>
            )}

            {quiz && !loading && (
              <div className="w-full max-w-3xl">
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                  <div className="rounded-xl bg-white p-2 shadow-sm">
                    <Brain className="h-4 w-4 text-slate-700" />
                  </div>
                  Prep4Exam
                </div>
                <QuizCard
                  questions={quiz.questions}
                  userAnswers={userAnswers}
                  setUserAnswers={setUserAnswers}
                />
              </div>
            )}

            {review && !loading && (
              <div className="w-full max-w-3xl">
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                  <div className="rounded-xl bg-white p-2 shadow-sm">
                    <ClipboardCheck className="h-4 w-4 text-slate-700" />
                  </div>
                  Prep4Exam
                </div>
                <ReviewCard data={review} />
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-lg">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Paste your notes or topic here..."
                className="w-full resize-none rounded-2xl border-0 bg-transparent p-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  {notes.trim().length} chars
                  {quiz ? ` • ${answeredCount}/${quiz.questions.length} answered` : ""}
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExplain}
                    disabled={!notes.trim() || loading !== null}
                    className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Explain
                  </button>

                  <button
                    onClick={handleGenerateQuiz}
                    disabled={!notes.trim() || loading !== null}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Quiz
                  </button>

                  {quiz && answeredCount > 0 && (
                    <button
                      onClick={handleReview}
                      disabled={loading !== null}
                      className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}