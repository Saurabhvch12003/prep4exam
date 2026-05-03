import { NextResponse } from "next/server";
import { getJsonCompletion } from "@/lib/ai";
import { reviewPrompt } from "@/lib/prompts";

function normalizeText(answer: string) {
  return String(answer || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s.-]/g, "")
    .trim();
}

function extractStrictNumber(answer: string) {
  const match = String(answer || "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function isAnswerCorrect(userAnswer: string, correctAnswer: string) {
  if (!userAnswer || !correctAnswer) return false;

  const userNum = extractStrictNumber(userAnswer);
  const correctNum = extractStrictNumber(correctAnswer);

  // If both answers contain numbers, compare numbers with sign.
  // Example: 1 !== -1, but -1 === -1
  if (userNum !== null && correctNum !== null) {
    return Math.abs(userNum - correctNum) < 0.0001;
  }

  const user = normalizeText(userAnswer);
  const correct = normalizeText(correctAnswer);

  return user === correct;
}

function buildScoreSummary(score: number, total: number) {
  if (total === 0) {
    return "No answers were reviewed. Please attempt the quiz first.";
  }

  const percentage = Math.round((score / total) * 100);

  if (percentage <= 40) {
    return "Your current understanding is weak, so you need more revision and practice on this topic before moving ahead.";
  }

  if (percentage <= 70) {
    return "You have partial understanding of the topic, but you should revise the weak areas and practice more questions.";
  }

  return "You have a good understanding of the topic. A little more revision and practice will help you become more confident.";
}

function buildFeedback(
  isCorrect: boolean,
  selectedAnswer: string,
  correctAnswer: string
) {
  if (isCorrect) {
    return "Correct. Your answer matches the expected answer.";
  }

  return `Incorrect. Your answer "${selectedAnswer}" is different from the correct answer "${correctAnswer}". Review this concept once more before moving ahead.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const questions = body?.questions;
    const userAnswers = body?.userAnswers;

    if (!Array.isArray(questions) || !userAnswers) {
      return NextResponse.json(
        { error: "Questions and user answers are required." },
        { status: 400 }
      );
    }

    const data = await getJsonCompletion(reviewPrompt(questions, userAnswers));

    const aiItems = Array.isArray(data.items) ? data.items : [];

    let correctCount = 0;

    const fixedItems = questions.map((question: any, index: number) => {
      const aiItem = aiItems[index] || {};

      const selectedAnswer = String(userAnswers[index] || "");
      const correctAnswer = String(
        question.correctAnswer || aiItem.correctAnswer || ""
      );

      const correct = isAnswerCorrect(selectedAnswer, correctAnswer);

      if (correct) correctCount++;

      return {
        question: question.question || aiItem.question || "",
        selectedAnswer,
        correctAnswer,
        isCorrect: correct,
        feedback: buildFeedback(correct, selectedAnswer, correctAnswer),
      };
    });

    const total = fixedItems.length;

    const wrongQuestions = fixedItems
      .filter((item: any) => !item.isCorrect)
      .map((item: any) => item.question)
      .filter(Boolean)
      .slice(0, 5);

    const fixedData = {
      ...data,
      items: fixedItems,
      score: correctCount,
      total,
      summary: buildScoreSummary(correctCount, total),
      weakAreas:
        wrongQuestions.length > 0
          ? wrongQuestions
          : ["No major weak areas found in this quiz."],
      reviseNext:
        Array.isArray(data.reviseNext) && data.reviseNext.length > 0
          ? data.reviseNext
          : [
              "Review the incorrect questions carefully.",
              "Revise the main concept again using simple examples.",
              "Practice similar questions to improve accuracy.",
            ],
    };

    return NextResponse.json(fixedData);
  } catch (error) {
    console.error("Review route error:", error);

    return NextResponse.json(
      { error: "Unable to review answers right now. Please try again." },
      { status: 500 }
    );
  }
}