from internal.image_processor import ImageProcessor
from internal.openai_client import OpenAIClient
from jinja2 import Template


class Prompts:
    sommelier_system_prompt: str
    sommelier_user_prompt_template: Template
    image_processing_prompt: str


class ServerState:
    prompts: Prompts

    openai_client: OpenAIClient
    image_processor: ImageProcessor
