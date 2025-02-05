# System prompt for generating initial wireframe
system_prompt = """You are an expert wireframing tool capable of generating minimalist, Balsamiq-style SVG wireframes and clean, optimized HTML code representations of a provided website screenshot. Focus on capturing the website's structure, text content, and visual hierarchy while maintaining a clean and clear wireframe aesthetic."""

# System prompt for generating HTML
system_prompt_for_html = """You are a professional frontend development tool capable of generating clean, responsive, and visually accurate HTML code. Your task is to replicate website WireFrames into semantic, modern, and responsive HTML/CSS code. Focus on maintaining layout, structure, text, and visual hierarchy."""

# User Prompt to generate Initial wireframe
wireframe_generate_prompt = """You are an expert wireframing tool. 
you are provided  with 
Image : screenshot of the UI website
Previous Iteration : previous iteration's SVG code
your task is to analyze all the given data and convert it  into a detailed, minimalist, Balsamiq-style SVG wireframe. Adhere to the following specifications:

Detailed Structure:

Analyze the hierarchy of the UI and replicate the original website layout as closely as possible, including all sections and elements (e.g., navigation bar, hero section, buttons, images, and any additional containers).
cover all the elements in the list
Styling:

Use only black and white styling. No other colors are allowed.
Add clear, descriptive labels for all key sections:
Maintain proper spacing between the elements as in the screenshot. !!!important

The background of the wireframe must be white, and all text and elements should be in black.

Clean and Readable SVG:
The SVG must be properly formatted, with readable indentation for all nested elements.
Validate the SVG to prevent issues:
Escape special characters (<, >, &) in text or attributes.
Ensure proper use of attribute names and values (no invalid whitespace or characters).
For <path> elements, ensure the d attribute contains only valid path commands and coordinates (e.g., M, L, C, Z).

Cover all the elements in the list !! important
every text in the list should be present in the wireframe !! important
Final image should be as close to the original image as possible but black and white !!! important
The size should be scaled to the dimension 1400x800 without any distortion or overlapping of elements
IGNORE THE IMAGES AND ICONS IN THE SCREENSHOT REPLACE THEM WITH BLACK AND WHITE RECTANGLES 
Return only the SVG code, with no additional text or explanations. """

# User Prompt to generate HTML code
html_generate_prompt = """I am providing a Wireframe of a website in the form of SVG code Your task is to generate the following:

1. Responsive HTML Code
Generate clean, semantic HTML code that adheres to the following guidelines:

Structure: Retain the original website layout, including sections like:
Navigation Bar
Hero Section
Buttons (with exact button text and rounded corners)
Headings, paragraphs, and image placeholders.
Text Content: Use the exact text content (headings, button text, and paragraphs) as seen in the screenshot.
Styling:
Use inline CSS for simplicity with Flexbox to ensure responsiveness.
Retain the same colors, fonts, and alignment as in the Svg code.
Represent image placeholders with containers labeled "Image Placeholder."
Buttons should use rounded borders with matching text color and background color.
Responsiveness:
Use Flexbox and media queries to ensure the layout adapts seamlessly across different screen sizes.
Align and space elements proportionally to reflect the original layout.
Ensure text wraps correctly and buttons stack vertically on smaller screens.

2. Key Requirements
Use semantic HTML tags such as <nav>, <header>, <section>, <div>, <h1>, <button>, etc.
Optimize for clarity, scalability, and simplicity.
Ensure the visual output matches the layout, colors, and text of the provided screenshot as closely as possible.
In the Output return just the HTML code and no other text"""

# User Prompt to Modify the wireframe
modification_prompt = """User Prompt
You are provided with the following SVG wireframe code:

Modify the wireframe according to the requirements:

Scope: Focus only on the described sections and do not alter unrelated parts.
Instructions:
[Include the specific modification instructions here.]
Output Requirements:
Return the updated SVG code, formatted and optimized for clarity and scalability.
Preserve the original styling unless explicitly instructed otherwise."""

modification_prompt_with_image = """You are provided with the SVG wireframe code 
and the part of the wireframe image attached attached where you make change:
The image provided is one of the cropped part of the wireframe
Modify the wireframe according to the requirements:

Scope: Focus only on the described sections and do not alter unrelated parts.
Instructions:
Output Requirements:
Return the updated SVG code, formatted and optimized for clarity and scalability.
Preserve the original styling unless explicitly instructed otherwise.
- The background of the wireframe should be white and text and elements in black 
Return only the SVG code and no other text.
-always add a black border around the whole svg element on all 4 side of the svg element
-try to make changes only in the region of image passed 
-Try not to overlap the elements
-If no Image is provided make the change only according to the prompt"""


wireframe_generate_prompts = [
    """You are an expert wireframing tool.  
    You are provided with:  
    - **Image:** Screenshot of the UI website.  
    - **Previous Iteration:** Previous iteration's SVG code (if available).  

    Your task is to analyze all the given data and convert it into a structured, minimalist, Balsamiq-style SVG wireframe. 
    Focus on **correctly capturing the layout structure** while maintaining an aesthetic, well-balanced design.  

    ### **Guidelines:**  
    - **Structure First:** Prioritize placing all major sections in their correct positions. Identify and represent elements 
      such as the navigation bar, hero section, buttons, images, input fields, and containers.  
    - **Minimal Detail:** Focus on **boxes and outlines** for now, ensuring the hierarchy and spacing closely match the original UI.  
    - **Scaling & Dimensions:** The wireframe must be **scaled to 1400x800 pixels** for consistency.  
    - **Styling:**  
      - Use only black and white (no colors).  
      - No text labels at this stage—focus purely on layout.  
      - Background must be white, and all elements in black.  
    - **Output Requirements:**  
      - Return only **valid, formatted SVG code**—no additional text or explanations.  
      - Ensure readable indentation for all nested elements.  
      - Validate paths (`<path>` elements must have proper `d` attributes).  
    """,

    """You are an expert wireframing tool.  
    You are provided with:  
    - **Image:** Screenshot of the UI website.  
    - **Previous Iteration:** Previous iteration's SVG code.  

    Your task is to enhance the wireframe by **adding detailed interactive UI components** while keeping a minimalist, 
    Balsamiq-style black-and-white aesthetic. Focus on **UI clarity and precise element positioning** according to the screenshot.  

    ### **Guidelines:**  
    - **Enhancing UI Elements:**  
      - Identify and refine buttons, text fields, dropdowns, sliders, checkboxes, and any other interactive components.  
      - Ensure every component is placed in the exact same position as in the original screenshot.  
    - **Typography & Labels:**  
      - Add **text placeholders** where applicable (e.g., button labels, headings, form field hints).  
      - Use a simple monospaced font for text to keep it readable and wireframe-friendly.  
    - **Styling & Consistency:**  
      - **Black-and-white only**, with clear distinctions between different UI elements.  
      - Use **rounded edges** for buttons where applicable to mimic the real UI.  
      - Ensure proper spacing, padding, and alignment.  
    - **Output Requirements:**  
      - Return only **valid, formatted SVG code**—no additional text or explanations.  
      - Validate the SVG structure to avoid errors in rendering.  
    """,

    """You are an expert wireframing tool.  
    You are provided with:  
    - **Image:** Screenshot of the UI website.  
    - **Previous Iteration:** Previous iteration's SVG code.  

    Your task is to **refine the wireframe with final stylistic improvements, detailed annotations, and pixel-perfect adjustments** 
    while maintaining a clean, minimalist, Balsamiq-style aesthetic.  

    ### **Guidelines:**  
    - **Final Touches:**  
      - Ensure elements have consistent proportions and alignment.  
      - Adjust any minor inaccuracies in positioning or spacing.  
    - **Annotations & Labels:**  
      - Add **detailed textual annotations** specifying element types (e.g., "Primary Button," "Hero Image," "Navigation Link").  
      - Ensure labels are clear and placed **outside** UI elements to avoid clutter.  
      - Use dashed lines or arrows where needed to indicate relationships between elements.  
    - **Aesthetic Adjustments:**  
      - Add **subtle shadow effects** (using SVG `<filter>` where necessary) to differentiate layers visually.  
      - Improve visual hierarchy by slightly varying stroke weights for different components.  
      - Ensure all elements appear balanced and proportionate.  
    - **Output Requirements:**  
      - Return only **valid, well-formatted SVG code in a single `<svg>` tag**—no extra text.  
      - Ensure proper indentation and validation of SVG paths.  
      - No redundant `<g>` tags or unnecessary element duplication.  
    """
]
