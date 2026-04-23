import OpenAI from "openai";

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("No valid JSON found in AI response.");
  }

  return cleaned.slice(start, end + 1);
}

export async function getJsonCompletion(prompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("Server configuration error: missing OpenRouter API key.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });

  try {
    const response = await client.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const text = response.choices[0]?.message?.content ?? "";
    const jsonText = extractJson(text);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("OpenRouter error:", error);
    throw new Error("AI service is temporarily unavailable. Please try again.");
  }
}