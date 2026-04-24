import { NextResponse } from "next/server";
import { getJsonCompletion } from "@/lib/ai";
import { reviewPrompt } from "@/lib/prompts";

function normalizeAnswer(answer: string) {
  return String(answer || "")
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "")
    .trim();
}

function extractNumber(answer: string) {
  const match = String(answer || "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function isAnswerCorrect(userAnswer: string, correctAnswer: string) {
  const user = normalizeAnswer(userAnswer);
  const correct = normalizeAnswer(correctAnswer);

  if (!user || !correct) return false;

  if (user === correct) return true;

  const userNum = extractNumber(userAnswer);
  const correctNum = extractNumber(correctAnswer);

  if (userNum !== null && correctNum !== null) {
    return Math.abs(userNum - correctNum) < 0.1;
  }

  if (correct.includes(user) && user.length >= 3) return true;
  if (user.includes(correct) && correct.length >= 3) return true;

  return false;
}

function buildScoreSummary(score: number, total: number) {
  const percentage = Math.round((score / total) * 100);

  if (percentage <= 40) {
    return "Your current understanding is weak, so you need more revision and practice on this topic before moving ahead.";
  }

  if (percentage <= 70) {
    return "You have partial understanding of the topic, but you should revise the weak areas and practice more questions.";
  }

  return "You have a good understanding of the topic. A little more revision and practice will help you become more confident.";
}

function buildFeedback(isCorrect: boolean, correctAnswer: string) {
  if (isCorrect) {
    return "Correct. Your answer matches the expected answer.";
  }

  return `Incorrect. The correct answer is "${correctAnswer}". Review this concept once more before moving ahead.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const questions = body?.questions;
    const userAnswers = body?.userAnswers;

    if (!questions || !userAnswers) {
      return NextResponse.json(
        { error: "Questions and user answers are required." },
        { status: 400 }
      );
    }

    const data = await getJsonCompletion(reviewPrompt(questions, userAnswers));

    const items = Array.isArray(data.items) ? data.items : [];

    let correctCount = 0;

    const fixedItems = items.map((item: any, index: number) => {
      const selectedAnswer = userAnswers[index] || "";
      const correctAnswer =
        item.correctAnswer || questions[index]?.correctAnswer || "";

      const correct = isAnswerCorrect(selectedAnswer, correctAnswer);

      if (correct) correctCount++;

      return {
        ...item,
        question: item.question || questions[index]?.question || "",
        selectedAnswer,
        correctAnswer,
        isCorrect: correct,
        feedback: buildFeedback(correct, correctAnswer),
      };
    });

    data.items = fixedItems;
    data.score = correctCount;
    data.total = fixedItems.length;
    data.summary = buildScoreSummary(correctCount, fixedItems.length);

    const weakAreasFromWrong = fixedItems
      .filter((item: any) => !item.isCorrect)
      .map((item: any) => item.question)
      .slice(0, 5);

    if (weakAreasFromWrong.length > 0) {
      data.weakAreas = weakAreasFromWrong;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Review route error:", error);

    return NextResponse.json(
      { error: "Unable to review answers right now. Please try again." },
      { status: 500 }
    );
  }
}