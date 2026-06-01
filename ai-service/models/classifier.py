import torch
import torch.nn as nn


class SimpleClassifier(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, num_classes: int):
        super().__init__()
        self.embedding = nn.EmbeddingBag(vocab_size, embed_dim, sparse=False)
        self.fc = nn.Linear(embed_dim, num_classes)

    def forward(self, text: str) -> torch.Tensor:
        embedded = self.embedding(text)
        return self.fc(embedded)


class TextClassifier:
    def __init__(self):
        self.model = None
        self.vocab = {}
        self.categories = ["daily", "shopping", "family", "bill", "other"]
        self.colors = ["blue", "red", "green", "yellow"]
        self._load_model()

    def _load_model(self):
        self.keywords = {
            "shopping": ["买", "购", "超市", "菜", "水果", "日用品", "衣服"],
            "bill": ["缴费", "水电", "房租", "账单", "还款", "保险"],
            "family": ["聚会", "旅行", "纪念日", "生日", "祭祖", "扫墓"],
            "daily": ["吃药", "锻炼", "体检", "上班", "开会", "学习"],
        }
        self.color_keywords = {
            "red": ["紧急", "重要", "急", "马上"],
            "green": ["买", "购", "超市", "菜"],
            "yellow": ["提醒", "注意", "别忘"],
        }

    def classify(self, title: str) -> dict:
        title_lower = title.lower()
        category = "other"
        max_score = 0
        for cat, keywords in self.keywords.items():
            score = sum(1 for kw in keywords if kw in title_lower)
            if score > max_score:
                max_score = score
                category = cat

        color = "blue"
        for c, keywords in self.color_keywords.items():
            if any(kw in title_lower for kw in keywords):
                color = c
                break

        return {
            "category": category,
            "color": color,
            "confidence": max_score / 3.0 if max_score > 0 else 0.0
        }
