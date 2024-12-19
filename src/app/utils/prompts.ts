
//System promt for generating initial wireframe
export const systemPrompt = "You are an expert wireframing tool capable of generating minimalist, Balsamiq-style SVG wireframes and clean, optimized HTML code representations of a provided website screenshot. Focus on capturing the website's structure, text content, and visual hierarchy while maintaining a clean and clear wireframe aesthetic."


//System promt for generating HTML
export const systemPromptForHtml = "You are a professional frontend development tool capable of generating clean, responsive, and visually accurate HTML code. Your task is to replicate website WireFrames into semantic, modern, and responsive HTML/CSS code. Focus on maintaining layout, structure, text, and visual hierarchy."

//User Prompt to generate Initial wireframe
export const wireframeGeneratePrompt = `I am providing a screenshot of a website. Convert it into a minimalist Balsamiq-style SVG wireframe that adheres to the following specifications:
            - Retain the original website layout (navigation bar, hero section, buttons, images).
            - Add clear labels for key sections like 'Navigation Bar', 'Hero Section', 'Image Placeholder', and 'Button'.
            - Include all the exact text from the screenshot.
            - Use black and white styling with dashed outlines.
            - Donot use any other colors other than black and white.
            - Ensure the SVG output is clean, simple, and scalable.
            - In the Output return just the svg code and no other text.
            - The background of the wireframe should be white and text and elements in black 
            -always add a black border around the whole svg element on all 4 side of the svg element
            Here is the website screenshot as Base64 attached`


////User Prompt to Html code
            export const htmlGeneratePrompt = `I am providing a Wireframe of a website in the form of SVG code Your task is to generate the following:

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
In the Output return just the HTML code and no other text`



//User Prompt to Modify the wireFrame wireframe
export const ModificationPrompt = `User Prompt
You are provided with the following SVG wireframe code:

Modify the wireframe according to the requirements:

Scope: Focus only on the described sections and do not alter unrelated parts.
Instructions:
[Include the specific modification instructions here.]
Output Requirements:
Return the updated SVG code, formatted and optimized for clarity and scalability.
Preserve the original styling unless explicitly instructed otherwise.`