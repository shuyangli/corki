import os
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAIError
from dotenv import load_dotenv
from api.models import RecommendationRequest, HealthResponse
from api.openai_client import OpenAIClient
from api.image_processor import ImageProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="AI Sommelier API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
openai_client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
image_processor = ImageProcessor()


@app.post("/api/recommend")
async def recommend_wine(request: RecommendationRequest):
    """Endpoint to get wine recommendations based on prompt and optional menu images."""
    try:
        # Extract menu text if images were provided
        menu_text = None
        if request.images and len(request.images) > 0:
            try:
                menu_text = image_processor.extract_text_from_image(request.images[0])
            except Exception as e:
                logger.error(f"Image processing error: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=400, detail=f"Failed to process image: {str(e)}"
                )

        system_prompt, user_content = openai_client.create_sommelier_prompt(
            request.prompt, menu_text
        )

        return StreamingResponse(
            openai_client.generate_streaming_response(system_prompt, user_content),
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
