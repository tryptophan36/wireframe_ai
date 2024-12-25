import { generateId, createDataStreamResponse, streamText } from 'ai';
import { Anthropic } from '@anthropic-ai/sdk';
import { htmlGeneratePrompt } from '@/app/utils/prompts';
import { systemPromptForHtml } from '@/app/utils/prompts';
import { anthropic } from "@ai-sdk/anthropic"

const anthropicAI = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
    const { svgCode } = await req.json();
    
    if (!svgCode) {
      return new Response('Sufficient data not provided', { status: 400 });
    }

    // const result =  streamText({
    //     model:anthropic("claude-3-5-sonnet-20241022"),
    //     system:systemPromptForHtml,
    //     prompt:htmlGeneratePrompt
    // }
    // );

    // return result.toTextStreamResponse();
    
   
    return createDataStreamResponse({
        execute: dataStream => {
          dataStream.writeData('initialized call');
    
          const result = streamText({
            model:anthropic("claude-3-5-sonnet-20241022"),
            system:systemPromptForHtml,
           prompt:htmlGeneratePrompt,
            onChunk() {
              dataStream.writeMessageAnnotation({ chunk: '123' });
            },
            onFinish() {
              // message annotation:
              dataStream.writeMessageAnnotation({
                id: generateId(), // e.g. id from saved DB record
                other: 'information',
              });
    
              // call annotation:
              dataStream.writeData('call completed');
            },
          });
    
          result.mergeIntoDataStream(dataStream);
        },
        onError: error => {
          
          return error instanceof Error ? error.message : String(error);
        },
      });
    
    
  } 
