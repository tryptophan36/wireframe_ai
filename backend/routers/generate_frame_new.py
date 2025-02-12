from fastapi import APIRouter, UploadFile, Form
from langchain_anthropic import ChatAnthropic  
from dotenv import load_dotenv
import base64
import logging
from typing import Optional, List, Dict
from pydantic import BaseModel
from utils.prompts import system_prompt, wireframe_generate_prompt
from .wireframe_workflow import create_workflow
from utils.frame_processor import process_section
from .sectioned_workflow import create_sectioned_workflow
from utils.image_processor import split_base64_image
from utils.omni_parser import OmniParser
# Load environment variables
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
# model = ChatOpenAI(
#     model="gpt-4o",
#     temperature=0,
#     max_tokens=8000
# )
class Section(BaseModel):
    name: str
    coordinates: Dict[str, int]  # x1, y1, x2, y2

class WireframeRequest(BaseModel):
    sections: List[Section] = []

# Initialize workflows
workflow = create_workflow()
sectioned_workflow = create_sectioned_workflow()

def handle_screenshot(screenshot: UploadFile) -> str:
    """Convert uploaded file to base64 string"""
    contents = screenshot.file.read()
    return base64.b64encode(contents).decode('utf-8')


@router.post("/generate-frame-new")
async def generate_frame_new(
    screenshot: UploadFile, 
    request_config: Optional[str] = "sectioned",
    userPrompt: Optional[str] = Form("")
):
    try:
        logger.info(f"Request config: {request_config}")
        # Convert screenshot to base64
        screenshot_contents = await screenshot.read()
        encoded_string = base64.b64encode(screenshot_contents).decode('utf-8')

        if request_config == "iterative":
            # Use original LangGraph workflow
            logger.info("Using iterative workflow")
            try:
                final_state = await workflow.ainvoke({
                    "base64_image": encoded_string,
                    "user_prompt": wireframe_generate_prompt,
                    "iterations": []
                })
                return {"wireframe": final_state}
            except Exception as e:
                logger.error(f"Error invoking workflow: {str(e)}")
                return {"error": str(e)}
        
        elif request_config == "sectioned":
             # Initialize and use OmniParser
            # logger.info("Connecting to OmniParser...")
            # omni_parser = OmniParser()
            # contents = await screenshot.read()
            # parser_text,parser_coordinates = await omni_parser.process_image(contents)
            # Use new sectioned workflow with parallel processing
            logger.info("Using sectioned workflow with parallel processing")
            try:
                sections_base64 = split_base64_image(encoded_string,save_debug_images=False)
                final_state = await sectioned_workflow.ainvoke({
                    "base64_image": sections_base64,
                    "sections": [],
                    "section_results": [],
                    "merged_result": [],
                    "image_processed": False,
                    "omni_parser_results": {
                        "parser_text": "",
                        "parser_coordinates": ""
                    },
                })
                return {
                    "wireframe": final_state["merged_result"][2]["merged_result"],
                }
            except Exception as e:
                logger.error(f"Error in sectioned workflow: {str(e)}")
                return {"error": str(e)}
        
        else:
            # Handle single-pass processing (existing code)
            base_prompt = (
                f"{userPrompt}\nFollow these instructions with the above prompt\n"
                "- In the Output return just the svg code and no other text."
            ) if userPrompt.strip() else wireframe_generate_prompt
            
            response = await process_section(
                encoded_string,
                base_prompt,
                system_prompt
            )
            return {"wireframe": response}

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"error": str(e)}


