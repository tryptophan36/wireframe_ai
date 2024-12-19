import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from '@/app/utils/prompts';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    console.log("/modifyWireframeCalled");
    const { svgCode, userPrompt } = await request.json();
    
    if (!svgCode || !userPrompt) {
      return NextResponse.json(
        { error: "sufficient data not provided" }, 
        { status: 400 }
      );
    }

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      temperature: 0,
      system: systemPrompt,
      messages: [
        { role: "user", content: [
            { type: "text", text: `You are provided with the SVG wireframe code attached:
Modify the wireframe according to the requirements:
Scope: Focus only on the described sections and do not alter unrelated parts.
Instructions:
${userPrompt}
Output Requirements:
Return the updated SVG code, formatted and optimized for clarity and scalability.
Preserve the original styling unless explicitly instructed otherwise.
 - The background of the wireframe should be white and text and elements in black 
Return only the SVG code and no other text.
 -always add a black border around the whole svg element on all 4 side of the svg element
` },
            { type: "text", text: svgCode },
        ]},
      ],
    });

    return NextResponse.json({ wireFrame: msg });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" }, 
      { status: 500 }
    );
  }
}