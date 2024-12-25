import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { systemPrompt } from "@/app/utils/prompts";
import { ContentBlockParam } from "@anthropic-ai/sdk/resources/index.mjs";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log("/modifyWireframeCalled");
    const formData = await request.formData();
    const blob =
      (formData.get("screenshot") as Blob) ||
      new Blob([], { type: "image/png" });
    const svgCode = (formData.get("svgCode") as string) || "";
    const userPrompt = (formData.get("userPrompt") as string) || "";

    if (!svgCode || !userPrompt) {
      return NextResponse.json(
        { error: "sufficient data not provided" },
        { status: 400 }
      );
    }

    let imageArray: ContentBlockParam[] = [];
    const arrayBuffer = await blob.arrayBuffer(); // Convert Blob to ArrayBuffer
    const buffer = Buffer.from(arrayBuffer); // Create a Buffer from ArrayBuffer
    const base64 = buffer.toString("base64");

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 5000,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert SVG editor. Your task is to modify the provided SVG wireframe code based on the given image and user instructions. Follow these guidelines strictly:

Inputs:

SVG Code: The complete SVG wireframe code.
Image: A representation of a part of the SVG code.
Scope:

Identify: First, locate the section of the SVG code that corresponds to the provided image. Focus only on this part.
Modify: Apply the changes specified in the user instructions (${userPrompt}) to the identified section.
Preserve: Do not alter unrelated sections or elements of the SVG.
Modification Instructions:

Make changes only to the identified part of the SVG based on the image and the user’s specified changes.
Ensure the modifications align seamlessly with the existing structure and style of the SVG.
Styling and Validation:

Consistency: Preserve the original styling unless explicitly instructed otherwise.
Colors: The background of the wireframe must remain white, and all text and elements should be in black.
Borders: Include a black border around the entire SVG element on all four sides.
Clean and Readable: Ensure the updated SVG is clean, readable, and properly formatted with clear indentation for nested elements.
Validation:
Escape special characters (<, >, &) within text or attribute values.
Use valid attribute names and values, avoiding invalid whitespace or characters.
For <path> elements, ensure the d attribute contains only valid path commands and coordinates (e.g., M, L, C, Z).
Output Requirements:

The SVG must be optimized for clarity, scalability, and direct usability.
Enhanced Detail:
Ensure modifications are precise and detailed, accurately reflecting the changes requested in the provided image and user instructions.
Important: Return the whole updated svg code  only and no other text 
`,
            },
            { type: "text", text: svgCode },
            {
              type: "image",
              source: {
                type: "base64",
                data: base64,
                media_type: "image/png",
              },
            },
          ],
        },
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
