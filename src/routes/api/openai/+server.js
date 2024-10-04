import { json } from "@sveltejs/kit";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "$env/static/private"; // Correct way to import server-side env variables

const openai = new OpenAI({
  apiKey: `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`,
});

export async function POST({ request }) {
  try {
    const { prompt } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use a cheaper model if applicable
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50, // Reduce token usage
    });

    return json({ text: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Error fetching from OpenAI:", error);
    return json(
      { error: "Something went wrong with OpenAI." },
      { status: 500 }
    );
  }
}
