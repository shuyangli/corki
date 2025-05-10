from typing import Optional, List
from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    prompt: str
    images: Optional[List[str]] = None  # list of base64 encoded images


class HealthResponse(BaseModel):
    status: str
