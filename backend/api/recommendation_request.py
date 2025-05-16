from typing import List, Optional
from fastapi import UploadFile, Form


class RecommendationRequest:
    def __init__(
        self,
        prompt: str = Form(...),
        images: Optional[List[UploadFile]] = Form(None),
    ):
        self.prompt = prompt
        self.images = images
