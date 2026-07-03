import json
import os

DB_PATH = "./data/db.json"

class SearchEngine:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.data = self.load_data()

    def load_data(self):
        """Load JSON database"""
        if not os.path.exists(self.db_path):
            print("❌ Database file not found!")
            return {}

        try:
            with open(self.db_path, "r", encoding="utf-8") as file:
                return json.load(file)
        except json.JSONDecodeError:
            print("❌ Invalid JSON format!")
            return {}

    def search(self, collection, keyword):
        """Search inside a specific collection"""
        results = []

        if collection not in self.data:
            print(f"❌ Collection '{collection}' not found!")
            return results

        for item in self.data[collection]:
            for key, value in item.items():
                if keyword.lower() in str(value).lower():
                    results.append(item)
                    break

        return results

    def pretty_print(self, results):
        """Display results nicely"""
        if not results:
            print("❌ No results found.")
            return

        print(f"\n🔍 Found {len(results)} result(s):\n")

        for i, item in enumerate(results, start=1):
            print(f"{i}. ------------------------")
            for key, value in item.items():
                print(f"{key}: {value}")
            print()


# 🚀 RUN SYSTEM
if _name_ == "_main_":
    engine = SearchEngine()

    while True:
        print("\n===== SEARCH ENGINE =====")
        collection = input("Enter collection (employees/payroll/etc): ")
        keyword = input("Enter search keyword: ")

        results = engine.search(collection, keyword)
        engine.pretty_print(results)

        again = input("Search again? (y/n): ")
        if again.lower() != "y":
            break