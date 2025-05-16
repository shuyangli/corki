import logging
import os
from typing import AsyncGenerator
from openai import OpenAI

logger = logging.getLogger(__name__)


class OpenAIClient:
    def __init__(self, system_prompt: str):
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY is not set")

        self.client = OpenAI(api_key=openai_api_key)
        self.system_prompt = system_prompt

    async def generate_streaming_response(
        self,
        user_content: str,
        model_name: str = "gpt-4.1-nano",
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response from OpenAI API."""

        user_message = [
            {"type": "text", "text": user_content},
        ]

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_message},
        ]

        response = self.client.chat.completions.create(
            model=model_name,
            messages=messages,
            stream=True,
        )

        # TODO: make this more structured.
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
