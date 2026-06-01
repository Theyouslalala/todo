from datetime import datetime
from typing import Optional


class TimeRecommender:
    def __init__(self):
        self.user_patterns = {}

    def recommend(self, user_id: str, category: str) -> Optional[str]:
        defaults = {
            "daily": "08:00",
            "shopping": "10:00",
            "family": "09:00",
            "bill": "09:00",
            "other": "10:00"
        }
        if user_id in self.user_patterns:
            pattern = self.user_patterns[user_id].get(category)
            if pattern:
                return pattern
        return defaults.get(category, "10:00")

    def learn_from_history(self, user_id: str, category: str, time: str):
        if user_id not in self.user_patterns:
            self.user_patterns[user_id] = {}
        if category not in self.user_patterns[user_id]:
            self.user_patterns[user_id][category] = []
        self.user_patterns[user_id][category].append(time)
        times = self.user_patterns[user_id][category]
        if len(times) >= 3:
            from collections import Counter
            most_common = Counter(times).most_common(1)[0][0]
            self.user_patterns[user_id][category] = most_common
