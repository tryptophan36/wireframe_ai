from pydantic import BaseModel
from langgraph.graph import StateGraph
from typing import Dict, List, Annotated
import logging
from utils.frame_processor import process_quadrant, merge_svg_codes
from langgraph.graph import END, START
from operator import add


logger = logging.getLogger(__name__)

class SectionedState(BaseModel):
    base64_image: Annotated[List[str], add]
    sections: Annotated[List[Dict], add] = []
    section_results: Annotated[List[Dict], add] = []  # Store results as a list of dicts
    merged_result: Annotated[List[Dict], add] = []
    image_processed: bool = False
    omni_parser_results: Dict[str, str] = {}

async def process_section_task(
    state: SectionedState,
    section_name: str,
    base64_image: str
) -> Dict:
    logger.info("Processing section: %s", section_name)
    response = await process_quadrant(
        base64_image,
        state.base64_image[2],
        section_name, 
        state.omni_parser_results
    )
    # Return a list with a single dict for the section result
    return response

async def merge_svg_sections(state: SectionedState) -> Dict:
    logger.info("Merging SVG sections")
    combined_results = []
    for result_dict in state.section_results:
        combined_results.append(result_dict)
    
    merged_response = await merge_svg_codes(combined_results, state.base64_image[2])
    return {
        "section_results": state.section_results,
        "merged_result": [{"merged_result": merged_response}],
        "image_processed": True,
        "base64_image": [""]
    }

def create_sectioned_workflow():
    # Build the graph
    graph = StateGraph(SectionedState)
    
    async def dummy_start(state: SectionedState) -> Dict:
        logger.info("Starting parallel processing")
        return {"merged_result": []}
    # Create section processors
    async def process_top(state: SectionedState) -> Dict:
        if state.image_processed:
            return {"section_results": []}  
        result = await process_section_task(state, "top",state.base64_image[0])
        return {"section_results": [{"top": result}]}

    async def process_upper_middle(state: SectionedState) -> Dict:
        if state.image_processed:
            return {"section_results": []} 
        result = await process_section_task(state, "upper_middle",state.base64_image[1])
        return {"section_results": [{"upper_middle": result}]}

    # async def process_lower_middle(state: SectionedState) -> Dict:
    #     if state.image_processed:
    #         return {"section_results": []}  
    #     result = await process_section_task(state, "lower_middle",state.base64_image[2])
    #     return {"section_results": [{"lower_middle": result}]}

    # async def process_bottom(state: SectionedState) -> Dict:
    #     if state.image_processed:
    #         return {"section_results": []}  
    #     result = await process_section_task(state, "bottom",state.base64_image[3])
    #     return {"section_results": [{"bottom": result}]}

    # Add nodes for parallel processing
    graph.add_node("dummy", dummy_start)
    graph.add_node("top", process_top)
    graph.add_node("upper_middle", process_upper_middle)
    # graph.add_node("lower_middle", process_lower_middle)
    # graph.add_node("bottom", process_bottom)
    graph.add_node("merge", merge_svg_sections)

    # Configure parallel processing using branches
    def join_branches(state: SectionedState) -> Dict:
        logger.info("Joining branches")
        
        return {
            "image_processed": True,
            "merged_result": state.section_results
        }

    # Set up parallel branches
    graph.add_node("join", join_branches)
    
    # Add edges for parallel processing
    graph.add_edge(START, "dummy")
    graph.add_edge("dummy", "top")
    graph.add_edge("dummy", "upper_middle")
    # graph.add_edge("dummy", "lower_middle")
    # graph.add_edge("dummy", "bottom")

    graph.add_edge("top", "join")
    graph.add_edge("upper_middle", "join")
    # graph.add_edge("lower_middle", "join")
    # graph.add_edge("bottom", "join")
    
    # Connect join to merge
    graph.add_edge("join", "merge")

   

    graph.add_edge("merge", END)

    return graph.compile()