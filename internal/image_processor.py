import logging
import base64
import asyncio
import os
from fastapi import UploadFile
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


class ImageProcessor:
    def __init__(
        self, image_processing_prompt: str, model_name: str = "gemini-2.0-flash"
    ):
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not set")

        self.image_processing_prompt = image_processing_prompt
        self.gemini_client = genai.Client(api_key=gemini_api_key)
        self.model_name = model_name

    async def extract_wine_list_from_images(self, images: list[UploadFile]) -> str:
        """Process images using Gemini and return the extracted wine list."""
        try:
            encoded_images = await asyncio.gather(
                *[self._encode_single_image(image) for image in images]
            )

            response = self.gemini_client.models.generate_content(
                model=self.model_name,
                contents=[*encoded_images, self.image_processing_prompt],
                # generation_config={
                #     "temperature": 0.2,
                #     "top_p": 0.8,
                #     "top_k": 40,
                # },
            )

            logger.info(f"Gemini response: {response.text}")

            return response.text

        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}", exc_info=True)
            raise Exception(f"Failed to process images with Gemini: {str(e)}")

    async def _encode_single_image(self, image: UploadFile) -> types.Part:
        content = await image.read()
        return types.Part.from_bytes(data=content, mime_type=image.content_type)
