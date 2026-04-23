import { NextResponse } from "next/server";
import { getJsonCompletion } from "@/lib/ai";
import { reviewPrompt } from "@/lib/prompts";

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

    if (typeof data.score === "number" && typeof data.total === "number") {
      data.summary = buildScoreSummary(data.score, data.total);
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