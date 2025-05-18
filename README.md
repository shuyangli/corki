# Corki

Your AI sommelier service that recommends wines based on food choices. This service accepts a user prompt and optionally a photo of a wine menu, then uses OpenAI's API to generate personalized wine recommendations.

## Features

- FastAPI API server with streaming responses
- Accepts user-specified prompts and optional menu images
- OCR processing for menu images (placeholder implementation)
- LLM integration for intelligent wine recommendations

## Setup - Backend

1. Install dependencies:
   ```
   cd backend
   uv pip install -r pyproject.toml
   ```
2. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8000
   ```
3. Start the server:
   ```
   uv run uvicorn server:app --reload
   ```

## Setup - Frontend

1. Install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file with the API base URL:
   ```
   VITE_API_BASE_URL=http://localhost:8989
   ```
3. Start the frontend:
   ```
   npm run dev
   ```

## Deployment

1. Backend: auto-deploys, configuration on render.com
2. Frontend: `npm run build && firebase deploy`

## Auto-generated API Documentation

FastAPI automatically generates API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc