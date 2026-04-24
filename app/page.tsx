"use client";

import { useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  ClipboardCheck,
  LoaderCircle,
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

type ChatTurn = {
  id: string;
  userText: string;
  lengthPreference?: string;
  explanation?: ExplanationResponse;
  quiz?: QuizResponse;
  review?: ReviewResponse;
  userAnswers?: Record<number, string>;
};

function ThinkingCard({ mode }: { mode: "explain" | "quiz" | "review" }) {
  const text =
    mode === "explain"
      ? "Thinking About Your Problem..."
      : mode === "quiz"
      ? "Creating a quiz from this topic..."
      : "Reviewing your answers...";

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-950 p-2 text-white">
          <LoaderCircle className="h-4 w-4 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Prep4Exam</p>
          <p className="text-sm text-slate-500">{text}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [notes, setNotes] = useState("");
  const [lengthPreference, setLengthPreference] = useState("detailed");
  const [loading, setLoading] = useState<"explain" | "quiz" | "review" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function resetSession() {
    setNotes("");
    setLengthPreference("detailed");
    setError(null);
    setMessages([]);
    setLoading(null);
    setActiveMessageId(null);
    textareaRef.current?.focus();
  }

  function scrollToElementById(id: string) {
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }

  function scrollToMessage(messageId: string) {
    scrollToElementById(`message-${messageId}`);
  }

  async function handleExplain() {
    if (!notes.trim()) return;

    const currentText = notes.trim();
    const currentLengthPreference = lengthPreference;
    const turnId = crypto.randomUUID();

    try {
      setLoading("explain");
      setError(null);
      setActiveMessageId(turnId);

      setMessages((prev) => [
        ...prev,
        {
          id: turnId,
          userText: currentText,
          lengthPreference: currentLengthPreference,
        },
      ]);

      setNotes("");
      scrollToElementById(`message-${turnId}`);

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: currentText,
          lengthPreference: currentLengthPreference,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to explain notes.");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === turnId ? { ...msg, explanation: data } : msg
        )
      );

      scrollToElementById(`explanation-${turnId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
      setActiveMessageId(null);
      textareaRef.current?.focus();
    }
  }

  async function handleGenerateQuizForMessage(messageId: string, text: string) {
    try {
      setLoading("quiz");
      setError(null);
      setActiveMessageId(messageId);

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quiz.");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, quiz: data, userAnswers: {} } : msg
        )
      );

      scrollToElementById(`quiz-${messageId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
      setActiveMessageId(null);
      textareaRef.current?.focus();
    }
  }

  async function handleReviewForMessage(messageId: string) {
    const targetMessage = messages.find((msg) => msg.id === messageId);

    if (!targetMessage?.quiz) return;

    try {
      setLoading("review");
      setError(null);
      setActiveMessageId(messageId);

      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: targetMessage.quiz.questions,
          userAnswers: targetMessage.userAnswers || {},
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to review answers.");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, review: data } : msg
        )
      );

      scrollToElementById(`review-${messageId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
      setActiveMessageId(null);
      textareaRef.current?.focus();
    }
  }

  function updateUserAnswers(messageId: string, answers: Record<number, string>) {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, userAnswers: answers } : msg
      )
    );
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleExplain();
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-slate-900">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 p-4">
          <button
            onClick={resetSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            New session
          </button>
        </div>

        <div className="overflow-y-auto p-4">
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

          {messages.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Previous Questions
              </p>

              <div className="space-y-2">
                {messages.map((message, index) => (
                  <button
                    key={message.id}
                    onClick={() => scrollToMessage(message.id)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="block font-medium text-slate-900">
                      Q{index + 1}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-slate-600">
                      {message.userText}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      <section className="min-h-screen flex-1 lg:ml-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
            <div className="rounded-xl bg-slate-950 p-2 text-white">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold sm:text-base">Prep4Exam</h1>
              <p className="text-xs text-slate-500">Chat-style AI study coach</p>
            </div>
          </div>
        </header>

        <div className="pb-[150px]">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
            {messages.length === 0 && !loading && (
              <div className="mx-auto mt-10 max-w-2xl text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                  How can I help you study today?
                </h2>
                <p className="mt-3 text-base leading-8 text-slate-600">
                  Paste your notes, then generate explanation, quiz, and review
                  in one session.
                </p>
              </div>
            )}

            {messages.map((message) => {
              const answeredCount = message.userAnswers
                ? Object.keys(message.userAnswers).length
                : 0;

              return (
                <div
                  key={message.id}
                  id={`message-${message.id}`}
                  className="scroll-mt-24 space-y-4"
                >
                  <div className="ml-auto w-full max-w-2xl rounded-3xl bg-slate-900 px-5 py-4 text-white shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                      You
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-base leading-8">
                      {message.userText}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Length: {message.lengthPreference || "detailed"}
                    </p>
                  </div>

                  {message.explanation && (
                    <div
                      id={`explanation-${message.id}`}
                      className="scroll-mt-24 w-full max-w-3xl space-y-3"
                    >
                      <ExplanationCard data={message.explanation} />

                      {!message.quiz && (
                        <button
                          onClick={() =>
                            handleGenerateQuizForMessage(
                              message.id,
                              message.userText
                            )
                          }
                          disabled={loading !== null}
                          className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Generate Quiz from this
                        </button>
                      )}
                    </div>
                  )}

                  {message.quiz && (
                    <div
                      id={`quiz-${message.id}`}
                      className="scroll-mt-24 w-full max-w-3xl space-y-3"
                    >
                      <QuizCard
                        questions={message.quiz.questions}
                        userAnswers={message.userAnswers || {}}
                        setUserAnswers={(updater) => {
                          const currentAnswers = message.userAnswers || {};
                          const updatedAnswers =
                            typeof updater === "function"
                              ? updater(currentAnswers)
                              : updater;

                          updateUserAnswers(message.id, updatedAnswers);
                        }}
                      />

                      {answeredCount > 0 && !message.review && (
                        <button
                          onClick={() => handleReviewForMessage(message.id)}
                          disabled={loading !== null}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Review this quiz
                        </button>
                      )}
                    </div>
                  )}

                  {message.review && (
                    <div
                      id={`review-${message.id}`}
                      className="scroll-mt-24 w-full max-w-3xl"
                    >
                      <ReviewCard data={message.review} />
                    </div>
                  )}

                  {loading && activeMessageId === message.id && (
                    <ThinkingCard mode={loading} />
                  )}
                </div>
              );
            })}

            {error && (
              <div className="w-full max-w-3xl rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-72">
          <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
              <textarea
                ref={textareaRef}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                rows={1}
                placeholder="Ask anything..."
                className="max-h-32 min-h-[44px] w-full resize-none border-0 bg-transparent text-base leading-7 text-slate-800 outline-none placeholder:text-slate-400"
              />

              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <select
                    value={lengthPreference}
                    onChange={(e) => setLengthPreference(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none"
                    aria-label="Response length"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="detailed">Detailed</option>
                    <option value="very detailed">Very Detailed</option>
                    <option value="1000 words">1000 words</option>
                    <option value="3000 words">3000 words</option>
                    <option value="5000 words">5000 words</option>
                    <option value="10000 words">10000 words</option>
                  </select>

                  <span className="text-xs text-slate-400">
                    {notes.trim().length} chars
                  </span>
                </div>

                <button
                  onClick={handleExplain}
                  disabled={!notes.trim() || loading !== null}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Explain
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-slate-400">
              Enter to send · Shift + Enter for new line
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}