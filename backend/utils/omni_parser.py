from gradio_client import Client, handle_file
import tempfile
import logging
import base64
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class OmniParser:
    def __init__(self):
        self.client = Client(
            "microsoft/OmniParser",
        )
        logger.info("OmniParser client initialized")

    async def process_image(self, screenshot_contents):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            temp_file.write(screenshot_contents)
            temp_file_path = temp_file.name

        # Process image with OmniParser
        logger.info("Processing image with OmniParser...")
        parser_result = self.client.predict(
            handle_file(temp_file_path),
            0.05,
            0.1,
        )
        logger.info("OmniParser processing successful")
        
        # Get base64 encoded image
        with open(parser_result[0], 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
        return encoded_string, parser_result[1],parser_result[2]