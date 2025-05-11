import logging
from typing import AsyncGenerator
from openai import OpenAI

logger = logging.getLogger(__name__)


class OpenAIClient:
    def __init__(self, api_key: str, system_prompt: str):
        self.client = OpenAI(api_key=api_key)
        self.system_prompt = system_prompt

    async def generate_streaming_response(
        self,
        user_content: str,
        base64_images: list[str] | None = None,
        model_name: str = "gpt-4.1-nano",
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response from OpenAI API."""

        user_message = [
            {"type": "text", "text": user_content},
        ]
        if base64_images:
            for img in base64_images:
                user_message.append(
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{img}",
                        },
                    },
                )

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
