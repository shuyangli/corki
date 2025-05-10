import logging

logger = logging.getLogger(__name__)


class ImageProcessor:
    def extract_text_from_image(self, image_data: str) -> str:
        """Extract text from a base64 encoded image using OCR."""
        # TODO: Call a service to extract text from the image (perhaps Gemini?)
        # Open the file from example_data/la_compagnie_flatiron_btg.txt and return the text as-is
        with open("example_data/la_compagnie_flatiron_btg.txt", "r") as f:
            return f.read()
