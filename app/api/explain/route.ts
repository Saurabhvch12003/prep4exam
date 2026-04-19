import { NextResponse } from "next/server";
import { getJsonCompletion } from "@/lib/ai";
import { explainPrompt } from "@/lib/prompts";

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

    const data = await getJsonCompletion(explainPrompt(notes));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to explain notes.",
      },
      { status: 500 }
    );
  }
}