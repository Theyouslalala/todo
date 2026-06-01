import os


class Config:
    HOST = os.getenv("AI_HOST", "0.0.0.0")
    PORT = int(os.getenv("AI_PORT", "8000"))
    ENABLE_AI = os.getenv("ENABLE_AI", "false").lower() == "true"
    CLASSIFIER_MODEL_PATH = os.getenv("CLASSIFIER_MODEL", "models/classifier.pt")
    WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
    CATEGORIES = ["daily", "shopping", "family", "bill", "other"]
    COLORS = ["red", "blue", "green", "yellow"]


config = Config()
