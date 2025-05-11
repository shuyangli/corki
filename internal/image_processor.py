import logging
import base64
import asyncio
from fastapi import UploadFile

logger = logging.getLogger(__name__)


class ImageProcessor:
    async def extract_text_from_image(self, image: UploadFile) -> str:
        """Extract text from an uploaded image using OCR."""
        # TODO: Call a service to extract text from the image (perhaps Gemini?)
        # Open the file from example_data/la_compagnie_flatiron_btg.txt and return the text as-is
        with open("example_data/la_compagnie_flatiron_btg.txt", "r") as f:
            return f.read()

    async def _encode_single_image(self, image: UploadFile) -> str:
        content = await image.read()
        encoded = base64.b64encode(content).decode("utf-8")
        return encoded

    async def encode_images_to_base64(self, images: list[UploadFile]) -> list[str]:
        encoded_images = await asyncio.gather(
            *[self._encode_single_image(image) for image in images]
        )
        return encoded_images
