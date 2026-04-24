import { NextResponse } from "next/server";
import { getJsonCompletion } from "@/lib/ai";
import { explainPrompt } from "@/lib/prompts";

function isBadSummary(summary: string) {
  const s = summary.toLowerCase();

  return (
    !summary ||
    summary.trim().length < 80 ||
    s.includes("summary of key points") ||
    s.includes("effective study and revision") ||
    s.includes("key points for effective")
  );
}

function buildFallbackSummary(data: any, notes: string) {
  const points = Array.isArray(data.keyPoints) ? data.keyPoints.slice(0, 4) : [];

  if (points.length > 0) {
    return `In short, this topic is about ${notes}. The most important things to remember are ${points.join(
      ", "
    )}. Focus on understanding the meaning first, then connect each point with examples. For exams, revise the core definition, major features, common mistakes, and practical applications.`;
  }

  return `In short, this topic is about ${notes}. Focus on understanding the basic meaning, important features, examples, and common mistakes. For exam revision, try to explain the topic in your own words and then test yourself with questions.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const notes = body?.notes?.trim();
    const lengthPreference = body?.lengthPreference?.trim() || "detailed";

    if (!notes) {
      return NextResponse.json(
        { error: "Notes are required." },
        { status: 400 }
      );
    }

    const data = await getJsonCompletion(explainPrompt(notes, lengthPreference));

    if (isBadSummary(data.revisionSummary)) {
      data.revisionSummary = buildFallbackSummary(data, notes);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Explain route error:", error);

    return NextResponse.json(
      { error: "Unable to generate explanation right now. Please try again." },
      { status: 500 }
    );
  }
}