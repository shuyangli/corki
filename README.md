# Corki

Your AI sommelier service that recommends wines based on food choices. This service accepts a user prompt and optionally a photo of a wine menu, then uses OpenAI's API to generate personalized wine recommendations.

## Features

- FastAPI API server with streaming responses
- Accepts user-specified prompts and optional menu images
- OCR processing for menu images (placeholder implementation)
- LLM integration for intelligent wine recommendations

## Setup

1. Clone the repository
2. For backend, install dependencies:
   ```
   cd backend
   uv pip install -r pyproject.toml
   ```
3. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8000
   ```
4. Start the server:
   ```
   uv run uvicorn server:app --reload
   ```
5. For frontend, install dependencies:
   ```
   npm install
   ```
6. Start the frontend:
   ```
   npm run dev
   ```

## Auto-generated API Documentation

FastAPI automatically generates API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc