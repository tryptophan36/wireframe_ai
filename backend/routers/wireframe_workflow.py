from pydantic import BaseModel
from langgraph.graph import StateGraph
from typing import Dict, List
import logging
from utils.prompts import system_prompt
from utils.frame_processor import process_section

logger = logging.getLogger(__name__)

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
    Focus on interactive elements and specific UI components make sure to cover all details and text with icons and position adjusted according to size provided
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
    Add detailed annotations and styling specifications Make SURE THERE ARE NO OVERLAPPING ELEMENTS or else something bad will happen
    FOCUS ON THE SYMMETRY AND AESTHETICS OF THE SCREENSHOT 
    mention in comments of the svg code what took the most time to generate
    """
    response = await process_section(
        state.base64_image,
        prompt,
        system_prompt,
        passPrompt,
        state.iterations[-1]
    )
    logger.info(f"Response generated")
    return { "base64_image": "", "iterations":[response.content],"user_prompt": ""}

# Build and return the workflow
def create_workflow():
    # Build the graph
    graph = StateGraph(WireframeState)

    graph.add_node(high_level_layout)
    graph.add_node(interactive_elements)
    graph.add_node(final_styling)

    graph.set_entry_point("high_level_layout")
    graph.add_edge("high_level_layout", "interactive_elements")
    graph.add_edge("interactive_elements", "final_styling")
    graph.set_finish_point("final_styling")

    return graph.compile()

def create_sectioned_workflow():
    # Build the graph
    graph = StateGraph(WireframeState)

    graph.add_node(high_level_layout)
    graph.add_node(interactive_elements)
    graph.add_node(final_styling)

    graph.set_entry_point("high_level_layout")
    graph.add_edge("high_level_layout", "interactive_elements")
    graph.add_edge("interactive_elements", "final_styling")
    graph.set_finish_point("final_styling")

    return graph.compile()

