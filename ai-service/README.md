# Family Todo AI Service

Optional AI service for smart features.

## Setup

```bash
conda create -n family-todo-ai python=3.10 -y
conda activate family-todo-ai
pip install -r requirements.txt
```

## Run

```bash
# Enable AI
export ENABLE_AI=true
python app.py

# Disable AI (default)
export ENABLE_AI=false
python app.py
```

## API Endpoints

- `GET /api/ai/health` - Health check
- `POST /api/ai/classify` - Classify todo title
- `POST /api/ai/recommend-time` - Recommend reminder time
- `POST /api/ai/speech-to-text` - Speech to text (placeholder)

## Toggle AI

Set `ENABLE_AI=true` environment variable to enable AI features.
When disabled, all endpoints return 503.
