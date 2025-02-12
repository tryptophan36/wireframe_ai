from typing import List, Dict
import asyncio
from pydantic import BaseModel


class Section(BaseModel):
    name: str
    coordinates: Dict[str, int]

async def create_quadrant_sections(image_width: int, image_height: int) -> List[Section]:
    """Create four horizontal sections from image dimensions"""
    section_height = image_height // 4
    
    sections = [
        Section(
            name="top",
            coordinates={"x1": 0, "y1": 0, "x2": image_width, "y2": section_height}
        ),
        Section(
            name="upper_middle",
            coordinates={"x1": 0, "y1": section_height, "x2": image_width, "y2": section_height * 2}
        ),
        Section(
            name="lower_middle",
            coordinates={"x1": 0, "y1": section_height * 2, "x2": image_width, "y2": section_height * 3}
        ),
        Section(
            name="bottom",
            coordinates={"x1": 0, "y1": section_height * 3, "x2": image_width, "y2": image_height}
        )
    ]
    return sections

