from fastapi import APIRouter, UploadFile, Form
from langchain_anthropic import ChatAnthropic  
from dotenv import load_dotenv
import base64
import os
import logging
from typing import Optional, List, Dict
from pydantic import BaseModel
from utils.prompts import system_prompt, wireframe_generate_prompt


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

# Define the workflow states
class WireframeState(BaseModel):
    base64_image: str
    user_prompt: str
    iterations: List[str]

# Define processing nodes
async def high_level_layout(state: WireframeState) -> Dict:
    logger.info("high_level_layout executed")
    prompt = f"{state.user_prompt}\n" if state.user_prompt else ""
    passPrompt = """
    Focus on these instructions religiously;
    Generate a high-level layout structure for the entire interface make it look clean and aesthetic"""
    response = await process_section(
        state.base64_image,
        prompt,
        system_prompt,
        passPrompt,
        None
    )
    logger.info(f"Response generated")
    return {"base64_image": state.base64_image, "iterations":[response.content],"user_prompt": state.user_prompt}

async def interactive_elements(state: WireframeState) -> Dict:
    logger.info("interactive_elements executed")
    prompt = f"{state.user_prompt}\n" if state.user_prompt else ""
    passPrompt = """
    Focus on these instructions religiously;
    Focus on interactive elements and specific UI components make sure to cover all details and position adjusted according to size provided
    """
    response = await process_section(
        state.base64_image,
        prompt,
        system_prompt,
        passPrompt,
        state.iterations[-1]
    )
    logger.info(f"Response generated")
    return {"base64_image": state.base64_image, "iterations":[response.content],"user_prompt": state.user_prompt}

async def final_styling(state: WireframeState) -> Dict:
    logger.info("final_styling executed")
    prompt = f"{state.user_prompt}\n" if state.user_prompt else ""
    passPrompt = """
    Focus on these instructions religiously;
    Add detailed annotations and styling specifications Make SURE THERE ARE NO OVERLAPPING ELEMENTS"""
    response = await process_section(
        state.base64_image,
        prompt,
        system_prompt,
        passPrompt,
        state.iterations[-1]
    )
    logger.info(f"Response generated")
    return { "base64_image": "", "iterations":[response.content],"user_prompt": ""}

# Build the graph
graph = StateGraph(WireframeState)

graph.add_node(high_level_layout)
graph.add_node(interactive_elements)
graph.add_node(final_styling)

graph.set_entry_point("high_level_layout")
graph.add_edge("high_level_layout", "interactive_elements")
graph.add_edge("interactive_elements", "final_styling")
graph.set_finish_point("final_styling")

workflow = graph.compile()

def handle_screenshot(screenshot: UploadFile) -> str:
    """Convert uploaded file to base64 string"""
    contents = screenshot.file.read()
    return base64.b64encode(contents).decode('utf-8')

async def process_section(
    base64_image: str,
    prompt: str,
    system_prompt: str,
    passPrompt,
    previous_code: Optional[str] = None
) -> dict:
    logger.info("pass executed ")
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
    
    return model.invoke(messages)

@router.post("/generate-frame-new")
async def generate_frame_new(
    screenshot: UploadFile, 
    request_config: Optional[str] = "iterative",
    userPrompt: Optional[str] = Form("")
):
    try:
        logger.info(f"Request config: {request_config}")
        # Convert screenshot to base64
        screenshot_contents = await screenshot.read()
        encoded_string = base64.b64encode(screenshot_contents).decode('utf-8')

        if request_config == "iterative":
            # Use LangGraph workflow
            logger.info(f"Iterative request_config: {request_config}")
            logger.info(f"invoking workflow")
            try:
                final_state = await workflow.ainvoke({
                    "base64_image": encoded_string,
                    "user_prompt": wireframe_generate_prompt,
                    "iterations": []
                })
                logger.info(f"final_state: {final_state}")
                return {"wireframe": final_state}
            except Exception as e:
                logger.error(f"Error invoking workflow: {str(e)}")
                return {"error": str(e)}
        
        elif request_config == "sectioned":
            # Process each section separately
            wireframe_sections = []
            for section in request_config.sections:
                section_prompt = f"""Focus on the following section of the screenshot:
                Region: {section.name}
                Coordinates: ({section.coordinates['x1']}, {section.coordinates['y1']}) to 
                           ({section.coordinates['x2']}, {section.coordinates['y2']})
                {wireframe_generate_prompt}"""
                
                section_response = await process_section(
                    encoded_string,
                    section_prompt,
                    system_prompt
                )
                wireframe_sections.append({
                    "section": section.name,
                    "wireframe": section_response
                })
            
            return {"wireframe_sections": wireframe_sections}
        
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


