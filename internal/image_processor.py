import logging
from fastapi import UploadFile

logger = logging.getLogger(__name__)


class ImageProcessor:
    async def extract_text_from_image(self, image: UploadFile) -> str:
        """Extract text from an uploaded image using OCR."""
        # TODO: Call a service to extract text from the image (perhaps Gemini?)
        # Open the file from example_data/la_compagnie_flatiron_btg.txt and return the text as-is
        with open("example_data/la_compagnie_flatiron_btg.txt", "r") as f:
            return f.read()
