from fastapi import APIRouter, UploadFile, Form, HTTPException
from langchain_anthropic import ChatAnthropic  
from anthropic import Anthropic
from dotenv import load_dotenv
import base64
import os
import logging
from utils.prompts import system_prompt, wireframe_generate_prompt


load_dotenv()
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

model = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",
    temperature=0,
    max_tokens=8000
)

# model = ChatOpenAI(
#     model="gpt-4o",
#     temperature=0,
#     max_tokens=8000
# )

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

@router.post("/modifyFrame")
async def modify_frame(
    screenshot: UploadFile,
    fullSvg: UploadFile,
    svgCode: str = Form(...),
    userPrompt: str = Form(...)
):
    try:
        logger.info("/modifyFrame called")
        
        if not svgCode or not userPrompt or not fullSvg:
            raise HTTPException(
                status_code=400, 
                detail="Sufficient data not provided"
            )

        # Convert screenshot to base64 if provided
        base64_image = None
        if screenshot:
            contents = await screenshot.read()
            base64_image = base64.b64encode(contents).decode('utf-8')

       

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": [
                {"type": "text", "text": """You are an expert SVG editor. Your task is to modify the provided SVG wireframe code based on the given images and user instructions. Follow these guidelines strictly:

Inputs:
SVG Code: The complete SVG wireframe code 
Images: Two images are provided:
1. The full svg without bounding box               
1. The full SVG rendered as an image for context with Bounding Box
            IMPORTANT     The area inside bounding box needs modification
Scope:
Identify: First, locate the section of the SVG code that corresponds to the provided Bounding Box.
Modifications are to be made to the identified section of the SVG code
Modify: Apply these changes specified in the user instructions:
 ({user_prompt}) Inside the bounding box !!IMPORTANT
Preserve: Do not alter unrelated sections or elements of the SVG.
Modification Instructions:
Make changes only to the identified part of the SVG based on the image and the user's specified changes.
Ensure the modifications align seamlessly with the existing structure and style of the SVG.
Styling and Validation:
Consistency: Preserve the original styling unless explicitly instructed otherwise.
Colors: The background of the wireframe must remain white, and all text and elements should be in black.
Clean and Readable: Ensure the updated SVG is clean, readable, and properly formatted with clear indentation for nested elements.
Validation:
Escape special characters (<, >, &) within text or attribute values.
Use valid attribute names and values, avoiding invalid whitespace or characters.
For <path> elements, ensure the d attribute contains only valid path commands and coordinates (e.g., M, L, C, Z).
Output Requirements:

Ensure modifications are precise and detailed, accurately reflecting the changes requested in the provided image and user instructions.
start with <svg> tag and end with </svg> tag !!!Important
 ALWAYS RETURN THE FULL SVG CODE DONT INCLDUE THINGS LIKE <!-- Rest of the SVG code remains unchanged --> <!-- ... --> IMPORTANT
 The changes should only be visible inside the bounding box area or else something bad will happen 
  Important: Return the whole updated svg code only and no other text """.format(user_prompt=userPrompt)},
                {"type": "text", "text": svgCode}
            ]}
        ]

        # Add images to messages if provided
        if base64_image:
            messages[1]["content"].append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{base64_image}"
                }
            })

        response = model.invoke(messages)
        logger.info(response)
        return {"wireFrame": response}

    except Exception as e:
        logger.error(f"Error in modify_frame: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Something went wrong"
        )