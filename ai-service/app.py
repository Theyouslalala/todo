from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import config
from models import TextClassifier, TimeRecommender

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Family Todo AI Service", version="1.0.0")

classifier = TextClassifier()
time_recommender = TimeRecommender()


class ClassifyRequest(BaseModel):
    title: str


class ClassifyResponse(BaseModel):
    category: str
    color: str
    confidence: float


class RecommendTimeRequest(BaseModel):
    user_id: str
    category: str


class RecommendTimeResponse(BaseModel):
    recommended_time: str


class HealthResponse(BaseModel):
    status: str
    ai_enabled: bool


@app.get("/api/ai/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", ai_enabled=config.ENABLE_AI)


@app.post("/api/ai/classify", response_model=ClassifyResponse)
async def classify_todo(request: ClassifyRequest):
    if not config.ENABLE_AI:
        raise HTTPException(status_code=503, detail="AI service is disabled")
    result = classifier.classify(request.title)
    return ClassifyResponse(**result)


@app.post("/api/ai/recommend-time", response_model=RecommendTimeResponse)
async def recommend_time(request: RecommendTimeRequest):
    if not config.ENABLE_AI:
        raise HTTPException(status_code=503, detail="AI service is disabled")
    recommended = time_recommender.recommend(request.user_id, request.category)
    return RecommendTimeResponse(recommended_time=recommended or "10:00")


@app.post("/api/ai/speech-to-text")
async def speech_to_text():
    if not config.ENABLE_AI:
        raise HTTPException(status_code=503, detail="AI service is disabled")
    return {"text": "语音识别功能开发中"}


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting AI service on {config.HOST}:{config.PORT}")
    logger.info(f"AI enabled: {config.ENABLE_AI}")
    uvicorn.run(app, host=config.HOST, port=config.PORT)
