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
        # Connect to OmniParser model
        logger.info("Connecting to OmniParser...")

        base64_image = None
        if screenshot:
            # Read the file into a bytes buffer
            contents = await screenshot.read()
            # Convert bytes to base64
            base64_image = base64.b64encode(contents).decode('utf-8')


        omni_parser_client = Client(
            "microsoft/OmniParser",
            hf_token=os.getenv("HF_TOKEN")
        )
        logger.info("OmniParser client connected")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            temp_file.write(await screenshot.read())
            temp_file_path = temp_file.name

        # Use default or custom user prompt
        build_user_prompt = (
            f"{userPrompt}\nFollow these instructions with the above prompt\n"
            "- In the Output return just the svg code and no other text."
        )
        prompt_to_use = build_user_prompt if userPrompt.strip() else wireframe_generate_prompt

        # Process image with OmniParser
        logger.info("Processing image with OmniParser...")
        parser_result =  omni_parser_client.predict(
            handle_file(temp_file_path),
            0.05,
            0.1,
        )
        logger.info("OmniParser processing successful")
        parser_image_url = parser_result[0]

        logger.info("Parser image URL:", parser_image_url)
        with open(parser_image_url, 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

        logger.info("Encoded string")
        # Generate UI hierarchy
        logger.info("Generating UI hierarchy...")
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": [

                {
                    "type":"text","text" : prompt_to_use
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/webp;base64,{encoded_string}"}
                },
                {"type": "text", "text": f"[1] {parser_result[1]}"},
            ]}
        ]
        
        wireframe_response = model.invoke(messages)
        # hierarchy_data_cleaned = [
        #     line.strip() 
        #     for line in hierarchy_response.content.split("\n") 
        #     if line.strip()
        # ]
        # logger.info(f"Hierarchy data cleaned: {hierarchy_response}")

        # # Generate wireframe
        # logger.info("Generating wireframe...")
        # messages = [
        #     {"role": "system", "content": system_prompt},
        #     {"role": "user", "content": [
        #         {"type": "text", "text": f"{prompt_to_use}"},
        #         {"type": "text", "text": f"[2] {hierarchy_data_cleaned}"},
        #         {
        #             "type": "image_url",
        #             "image_url": {"url": f"data:image/webp;base64,{encoded_string}"}
        #         }
        #     ]}
        # ]
        
        # wireframe_response = model.invoke(messages)
        logger.info(f"Wireframe response: {wireframe_response}")
        return {"wireframe": wireframe_response}


    except httpx.HTTPError as e:
        logger.error(f"HTTP error: {str(e)}")
        return {"error": f"HTTP error: {str(e)}"}
    except HTTPException as he:
        logger.error(f"HTTP Exception: {str(he.detail)}")
        raise he
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"error": str(e)}