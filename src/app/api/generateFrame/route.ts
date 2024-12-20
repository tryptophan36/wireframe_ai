import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt, wireframeGeneratePrompt } from '@/app/utils/prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('screenshot') as File;
    const userPrompt = formData.get('userPrompt') as string || ""; // Get userPrompt from formData
    
    const buildUserPrompt = `${userPrompt} 
                              Follow these instructions with the above prompt
                              - In the Output return just the svg code and no other text.
                             `
    // Use wireframeGeneratePrompt if userPrompt is empty
    const promptToUse = userPrompt.trim() ? buildUserPrompt : wireframeGeneratePrompt;
    
    if (!file) {
      return NextResponse.json({ error: "No screenshot uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 5000,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptToUse },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    return NextResponse.json({ wireframe: msg });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}