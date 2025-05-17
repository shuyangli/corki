import os
import logging
import uvicorn

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAIError
from dotenv import load_dotenv
from api.health_response import HealthResponse
from internal.openai_client import OpenAIClient
from internal.image_processor import ImageProcessor
from server_state import ServerState, Prompts
from jinja2 import Environment, select_autoescape

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

jinja_env = Environment(autoescape=select_autoescape(["html", "xml"]))


# Static prompt templates, loaded on server startup.
SERVER_STATE = ServerState()

# Load environment variables from .env file
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load various static data on server startup.
    prompts = Prompts()
    with open("prompts/sommelier_system_prompt.txt", "r") as f:
        prompts.sommelier_system_prompt = f.read()
    with open("prompts/image_processing_prompt.txt", "r") as f:
        prompts.image_processing_prompt = f.read()
    with open("prompts/sommelier_user_prompt_template.txt", "r") as f:
        user_prompt_template = f.read()
        prompts.sommelier_user_prompt_template = jinja_env.from_string(
            user_prompt_template
        )

    SERVER_STATE.prompts = prompts
    SERVER_STATE.openai_client = OpenAIClient(
        system_prompt=SERVER_STATE.prompts.sommelier_system_prompt,
    )
    SERVER_STATE.image_processor = ImageProcessor(
        image_processing_prompt=SERVER_STATE.prompts.image_processing_prompt
    )
    yield


app = FastAPI(title="AI Sommelier API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/recommend")
async def recommend_wine(
    prompt: str = Form(...),
    images: list[UploadFile] = File(None),
):
    """Endpoint to get wine recommendations based on prompt and optional menu images."""
    try:
        wine_list = None
        if images:
            try:
                # Process images with Gemini first
                image_processor = SERVER_STATE.image_processor
                wine_list = await image_processor.extract_wine_list_from_images(images)

            except Exception as e:
                logger.error(f"Image processing error: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=400, detail=f"Failed to process image: {str(e)}"
                )

        user_prompt = SERVER_STATE.prompts.sommelier_user_prompt_template.render(
            wine_list=wine_list, user_prompt=prompt
        )

        openai_client = SERVER_STATE.openai_client
        return StreamingResponse(
            openai_client.generate_streaming_response(user_prompt),
            media_type="text/event-stream",
        )
    except OpenAIError as e:
        logger.error(f"OpenAI API error in recommend_wine: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail="An error occurred while generating recommendations"
        )
    except Exception as e:
        logger.error(f"Unexpected error in recommend_wine: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
