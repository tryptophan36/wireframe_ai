import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { systemPrompt, wireframeGeneratePrompt } from "@/app/utils/prompts";
import { Client } from "@gradio/client";
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type GradioData = {
  type: "data";
  time: string; // ISO date string
  data: [
    {
      path: string;
      url: string;
      size: number | null;
      orig_name: string;
      mime_type: string | null;
      is_stream: boolean;
      meta: Record<string, unknown>;
    },
    string, // Text data extracted from the image
    Record<string, [number, number, number, number]> // Bounding box data
  ];
};

export async function POST(request: NextRequest) {
  try {
    const omniParserClient = await Client.connect("microsoft/OmniParser", {
     
    });
    const formData = await request.formData();
    const file = formData.get("screenshot") as File;
    const userPrompt = (formData.get("userPrompt") as string) || ""; // Get userPrompt from formData

    const buildUserPrompt = `${userPrompt} 
                              Follow these instructions with the above prompt
                              - In the Output return just the svg code and no other text.

                             `;
    // Use wireframeGeneratePrompt if userPrompt is empty
    const promptToUse = userPrompt.trim()
      ? buildUserPrompt
      : wireframeGeneratePrompt;

    if (!file) {
      return NextResponse.json(
        { error: "No screenshot uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Process image with OmniParser
    const parserResult = await omniParserClient.predict("/process", {
      image_input: file,
      box_threshold: 0.05,
      iou_threshold: 0.1,
    });
    const omniParserResult = parserResult as unknown as GradioData;
    const parserImageUrl = omniParserResult?.data[0]?.url;

    const response = await fetch(parserImageUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);

    // Convert the image to Buffer and encode it to Base64
    const OmniparserImagebuffer = await response.arrayBuffer();
    const OmniparserImagebase64Image = Buffer.from(
      OmniparserImagebuffer
    ).toString("base64");

    //Intermediate step to get the hierarchy of the UI
    const hierarchyData = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
      temperature: 1,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `

The output value that appears in the "Image Output" Image component.
[1] str
The output value that appears in the "Parsed screen elements" Textbox component.
You are provided with this output. Your task it to organize text elements & corresponding coordinates based on their UI hierarchy. You have been provided with an image for reference.
give the data with as much detail as possible. to the original image best to your ability covering every small elements,rectangles and text of every part of the image.
return the output with all the items.
`,
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/webp",
                data: OmniparserImagebase64Image || "",
              },
            },
            {
              type: "text",
              text: `[1] ${omniParserResult?.data[1]}`,
            },
          ],
        },
      ],
    });
    const hierarchyDataCleaned: string[] = (
      hierarchyData.content[0] as { type: "text"; text: string }
    )?.text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    console.log(hierarchyDataCleaned);
    
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
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
                data: base64Image || "",
              },
            },
            {
              type: "text",
              text: `[2] ${hierarchyDataCleaned}`,
            },
          ],
        },
      ],
    });
    console.log(msg);
    return NextResponse.json({ wireframe: msg });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
