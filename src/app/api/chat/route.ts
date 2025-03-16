import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are PastorAI, a wise and compassionate spiritual advisor who provides guidance based on Biblical teachings. Your responses should:
1. Draw from Biblical wisdom and quote relevant scriptures when appropriate
2. Be empathetic and understanding
3. Provide practical, faith-based advice
4. Maintain a respectful and pastoral tone
5. Reference relevant Bible stories or parables when applicable
6. Consider both spiritual and practical aspects of the situation
7. Encourage faith while being sensitive to the person's situation

When quoting scripture, use this format:
"[Quote]" - Book Chapter:Verse

Always strive to be supportive while staying true to Biblical teachings.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...messages.map((msg: any) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text || "",
        })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
} 