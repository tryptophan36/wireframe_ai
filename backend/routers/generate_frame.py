from fastapi import APIRouter, UploadFile, Form, HTTPException
from langchain_anthropic import ChatAnthropic  
from anthropic import Anthropic
from gradio_client import Client, handle_file
from dotenv import load_dotenv
import base64
import os
import httpx
import logging
import tempfile
from typing import Optional


from utils.prompts import system_prompt, wireframe_generate_prompt
from utils.omni_parser import OmniParser
from utils.frame_processor import process_section

load_dotenv()
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize API clients
model = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",
    temperature=0,
    max_tokens=8000
)

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

@router.post("/generate-frame")
async def generate_frame(screenshot: UploadFile, userPrompt: Optional[str] = Form("")):
    try:
        # Initialize and use OmniParser
        logger.info("Connecting to OmniParser...")
        omni_parser = OmniParser()
        contents = await screenshot.read()
        encoded_string, parser_text = await omni_parser.process_image(contents)

        # Build prompt
        build_user_prompt = (
            f"{userPrompt}\nFollow these instructions with the above prompt\n"
            "- In the Output return just the svg code and no other text."
        )
        prompt_to_use = build_user_prompt if userPrompt.strip() else wireframe_generate_prompt
        
        return await process_section(
            base64_image=encoded_string,
            prompt=prompt_to_use,
            system_prompt=system_prompt,
            passPrompt=parser_text,
            previous_code=None
        )

    except httpx.HTTPError as e:
        logger.error(f"HTTP error: {str(e)}")
        return {"error": f"HTTP error: {str(e)}"}
    except HTTPException as he:
        logger.error(f"HTTP Exception: {str(he.detail)}")
        raise he
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"error": str(e)}