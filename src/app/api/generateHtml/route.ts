import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { systemPromptForHtml, htmlGeneratePrompt } from '@/app/utils/prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { svgCode } = await request.json();

    if (!svgCode) {
      return NextResponse.json({ error: "sufficient data not provided" }, { status: 400 });
    }

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0,
      system: systemPromptForHtml,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: htmlGeneratePrompt },
            { type: "text", text: svgCode }
          ],
        },
      ],
    });

    return NextResponse.json({ htmlCode: msg });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}