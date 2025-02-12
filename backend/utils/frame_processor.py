from langchain_anthropic import ChatAnthropic
import logging
from typing import  Optional, Dict, List
from utils.prompts import system_prompt, wireframe_generate_prompt,wireframe_divide_prompt

logger = logging.getLogger(__name__)

model = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",
    temperature=0,
    max_tokens=8000
)


async def process_section(
    base64_image: str,
    prompt: str,
    system_prompt: str,
    passPrompt: str,
    previous_code: Optional[str] = None
) -> dict:
    logger.info("pass executed")
    
    # Add previous code to prompt if available
    if previous_code:
        prompt = f"""Previous iteration's SVG code:
{previous_code}

{prompt}"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": [
            {
                "type": "text",
                "text": prompt
            },
            {
                "type": "text",
                "text": passPrompt
            },
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{base64_image}"}
            },
        ]}
    ]
    
    try:
        response =  model.invoke(messages)
        logger.info(f"Processing response: {response}")
        return response  # Return the response directly without wrapping
    except Exception as e:
        logger.error(f"Error in process_section: {str(e)}")
        raise e 

async def process_quadrant(
    base64_image: str,
    full_image: str,
    quadrant_name: str,
    omni_parser_results: Dict[str, str]
) -> str:
    quadrant_prompt = f"""
    {wireframe_divide_prompt}

   """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": [
            {
                "type": "text",
                "text": quadrant_prompt
            },
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{base64_image}"}
            },
            {
                "type": "text",
                "text":omni_parser_results["parser_text"]
            },
            {
                "type": "text",
                "text":omni_parser_results["parser_coordinates"]
            }
        ]}
    ]
    
    try:
        response = model.invoke(messages)
        print(response.content)
        logger.info(f"Quadrant {quadrant_name} processed")
        return response.content
    except Exception as e:
        logger.error(f"Error processing quadrant {quadrant_name}: {str(e)}")

        raise e

async def merge_svg_codes(svg_codes: List[Dict], base64_image: str) -> str:
    """Merge multiple SVG codes into a single cohesive SVG"""
    
    merge_prompt = """You are a specialized SVG code merger.
     You are an expert in SVG generation and modification. Your task is to take the following inputs:

A screenshot of a screen (which represents the final desired layout).
- A list of SVG code snippets, each representing a **horizontal section** of the screen **from top to bottom**.

Your goal is to perfectly modify, adjust, and merge the SVG snippets to match the exact layout, proportions, and structure of the screenshot. Ensure that:
The final SVG is pixel-perfect, visually identical to the screenshot.
It remains monochrome (black and white only)—no colors or shading.
Any distortions, misalignments, or inconsistencies are corrected.
include all borders and padding in the svg code from the screenshot !!IMPORTANT

scale the svg to 1500x800 and spread the elements evenly maintaining the symmetry and aesthetics of the screenshot !!important
INCLUDE ALL THE CODE FROM THE IN THE SVG CODE PROVIDED or else something bad will happen
return only the svg code dont include anything else
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": [
            {
                "type": "text",
                "text": merge_prompt
            },
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{base64_image}"}
            },
        ]}
    ]
    
    # Add each quadrant's code as a separate message
    for quadrant_dict in svg_codes:
        for quadrant_name, svg in quadrant_dict.items():
            messages.append({
                "role": "user",
                "content": f"{quadrant_name} Section SVG:\n{svg}"
            })
    
    messages.append({
        "role": "user",
        "content": "REMEMBER TO RETURN ONLY THE SVG CODE, NO EXPLANATIONS or other text"
    })
    
    try:
        response = model.invoke(messages)
        logger.info("SVG codes merged successfully")
        print(response.content)
        return response.content
    except Exception as e:
        logger.error(f"Error merging SVG codes: {str(e)}")
        raise e 