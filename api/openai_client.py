import logging
from typing import Optional, AsyncGenerator
from openai import OpenAI, OpenAIError

logger = logging.getLogger(__name__)


class OpenAIClient:
    def __init__(self, api_key: str, model_name: str = "gpt-4.1-nano"):
        self.client = OpenAI(api_key=api_key)
        self.model_name = model_name

    def create_sommelier_prompt(
        self, user_prompt: str, menu_text: Optional[str] = None
    ) -> tuple[str, str]:
        """Create system and user prompts for the OpenAI API."""
        system_prompt = """You are an expert AI sommelier with deep knowledge of wine and food pairings.
        Your task is to recommend wines that would pair well with the user's meal.
        If a menu is provided, only recommend wines that appear on that menu.
        If no menu is provided, recommend 2-3 general wine styles that would work well.

        Explain your recommendations with brief tasting notes and why they pair well with the food.
        Keep your responses concise but informative."""

        user_content = f"I'm planning to order: {user_prompt}"
        if menu_text:
            user_content += f"\n\nHere's the wine menu:\n{menu_text}"

        return system_prompt, user_content

    async def generate_streaming_response(
        self, system_prompt: str, user_content: str
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response from OpenAI API."""
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
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
