import { NextResponse } from "next/server";
import { getJsonCompletion } from "@/lib/ai";
import { explainPrompt } from "@/lib/prompts";

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

    const data = await getJsonCompletion(
      explainPrompt(notes, lengthPreference)
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Explain route error:", error);

    return NextResponse.json(
      { error: "Unable to generate explanation right now. Please try again." },
      { status: 500 }
    );
  }
}