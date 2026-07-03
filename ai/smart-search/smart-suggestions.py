import json
import os
from difflib import get_close_matches
from collections import Counter

DB_PATH = "./data/db.json"

class SmartSuggestions:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.data = self.load_data()
        self.keywords = self.extract_keywords()

    def load_data(self):
        if not os.path.exists(self.db_path):
            print("❌ Database not found!")
            return {}

        with open(self.db_path, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except:
                print("❌ Invalid JSON!")
                return {}

    def extract_keywords(self):
        """Extract all searchable words from DB"""
        words = []

        for collection in self.data.values():
            for item in collection:
                for value in item.values():
                    for word in str(value).split():
                        words.append(word.lower())

        return words

    def suggest(self, query, limit=5):
        """Get smart suggestions"""
        query = query.lower()

        # Close matches (typo fix)
        matches = get_close_matches(query, self.keywords, n=limit, cutoff=0.5)

        # Frequency based ranking
        freq = Counter(self.keywords)
        ranked = sorted(matches, key=lambda x: freq[x], reverse=True)

        return ranked[:limit]

    def trending(self, limit=5):
        """Top trending keywords"""
        freq = Counter(self.keywords)
        return [word for word, _ in freq.most_common(limit)]


# 🚀 TEST
if _name_ == "_main_":
    engine = SmartSuggestions()

    while True:
        print("\n===== SMART SUGGESTIONS =====")
        query = input("Type something: ")

        suggestions = engine.suggest(query)
        trends = engine.trending()

        print("\n💡 Suggestions:")
        for s in suggestions:
            print(" -", s)

        print("\n🔥 Trending:")
        for t in trends:
            print(" -", t)

        again = input("\nContinue? (y/n): ")
        if again.lower() != "y":
            break