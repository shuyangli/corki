import logging
from typing import AsyncGenerator
from openai import OpenAI, OpenAIError

logger = logging.getLogger(__name__)


class OpenAIClient:
    def __init__(self, api_key: str, system_prompt: str):
        self.client = OpenAI(api_key=api_key)
        self.system_prompt = system_prompt

    async def generate_streaming_response(
        self, user_content: str, model_name: str = "gpt-4.1-nano"
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response from OpenAI API."""
        try:
            response = self.client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_content},
                ],
                stream=True,
            )

            # TODO: make this more structured.
            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield f"data: {chunk.choices[0].delta.content}\n\n"

            yield "data: [DONE]\n\n"
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {str(e)}", exc_info=True)
            yield f"data: [ERROR] {str(e)}\n\n"
            yield "data: [DONE]\n\n"
