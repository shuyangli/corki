import os
import logging

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAIError
from dotenv import load_dotenv
from api.health_response import HealthResponse
from internal.openai_client import OpenAIClient
from internal.image_processor import ImageProcessor
from server_state import ServerState
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
    with open("prompts/sommelier_system_prompt.txt", "r") as f:
        SERVER_STATE.sommelier_system_prompt = f.read()
    with open("prompts/sommelier_user_prompt_template.txt", "r") as f:
        user_prompt_template = f.read()
        SERVER_STATE.sommelier_user_prompt_template = jinja_env.from_string(
            user_prompt_template
        )
    SERVER_STATE.openai_client = OpenAIClient(
        api_key=os.getenv("OPENAI_API_KEY"),
        system_prompt=SERVER_STATE.sommelier_system_prompt,
    )
    SERVER_STATE.image_processor = ImageProcessor()
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
        # Extract menu text if images were provided
        menu_text = None
        if images:
            try:
                image_processor = SERVER_STATE.image_processor
                menu_text = await image_processor.extract_text_from_image(images[0])
            except Exception as e:
                logger.error(f"Image processing error: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=400, detail=f"Failed to process image: {str(e)}"
                )

        user_prompt = SERVER_STATE.sommelier_user_prompt_template.render(
            user_prompt=prompt, menu_text=menu_text
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
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
