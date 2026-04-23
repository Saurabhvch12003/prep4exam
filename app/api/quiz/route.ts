import { NextResponse } from "next/server";
import { getJsonCompletion } from "@/lib/ai";
import { quizPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const notes = body?.notes?.trim();

    if (!notes) {
      return NextResponse.json(
        { error: "Notes are required." },
        { status: 400 }
      );
    }

    const data = await getJsonCompletion(quizPrompt(notes));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Quiz route error:", error);

    return NextResponse.json(
      { error: "Unable to generate quiz right now. Please try again." },
      { status: 500 }
    );
  }
}