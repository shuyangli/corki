from internal.image_processor import ImageProcessor
from internal.openai_client import OpenAIClient
from jinja2 import Template


class ServerState:
    sommelier_system_prompt: str
    sommelier_user_prompt_template: Template

    openai_client: OpenAIClient
    image_processor: ImageProcessor
