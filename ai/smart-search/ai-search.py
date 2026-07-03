import json
import os
from difflib import SequenceMatcher

DB_PATH = "./data/db.json"

class AISearch:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.data = self.load_data()

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

    def similarity(self, a, b):
        return SequenceMatcher(None, a.lower(), b.lower()).ratio()

    def search(self, query):
        results = []

        for collection, items in self.data.items():
            for item in items:
                score = 0

                for key, value in item.items():
                    sim = self.similarity(str(value), query)
                    score = max(score, sim)

                if score > 0.4:  # threshold
                    results.append({
                        "collection": collection,
                        "data": item,
                        "score": round(score, 2)
                    })

        # Sort by score
        results.sort(key=lambda x: x["score"], reverse=True)

        return results

    def pretty_print(self, results):
        if not results:
            print("❌ No results found")
            return

        print(f"\n🔍 Found {len(results)} results:\n")

        for i, res in enumerate(results, start=1):
            print(f"{i}. [{res['collection']}] (score: {res['score']})")
            for k, v in res["data"].items():
                print(f"   {k}: {v}")
            print("-" * 30)


# 🔥 TEST RUN
if _name_ == "_main_":
    engine = AISearch()

    while True:
        print("\n===== AI SEARCH ENGINE =====")
        query = input("Enter search query: ")

        results = engine.search(query)
        engine.pretty_print(results)

        again = input("Search again? (y/n): ")
        if again.lower() != "y":
            break