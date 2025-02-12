import base64
from io import BytesIO
from PIL import Image

def split_base64_image(base64_string, save_debug_images=False):
    """Splits a base64-encoded image into 4 horizontal sections and returns them as base64 strings.
    If save_debug_images is True, saves the sections as separate files for visual inspection."""
    
    # Decode Base64 image
    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data))
    

    # Get dimensions
    width, height = image.size
    section_height = height // 2  # Divide into 4 equal horizontal sections

    sections_base64 = []  # List to store base64-encoded sections

    for i in range(2):
        # Crop each section
        section = image.crop((0, i * section_height, width, (i + 1) * section_height))

        # Save debug images if requested
        if save_debug_images:
            section.save(f"debug_section_{i+1}.png")

        # Convert cropped section back to Base64
        buffered = BytesIO()
        section.save(buffered, format=image.format)  # Preserve original format
        section_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        sections_base64.append(section_base64)
    sections_base64.append(base64_string)
    return sections_base64