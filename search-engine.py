import json
import os

class SearchEngine:
    def __init__(self, db_path="./data/db.json"):
        self.db_path = db_path
        self.data = self.load_data()

    def load_data(self):
        """Load JSON database"""
        if not os.path.exists(self.db_path):
            print("Database not found!")
            return {}

        with open(self.db_path, "r", encoding="utf-8") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                print("Invalid JSON format!")
                return {}

    def search(self, collection, query):
        """
        Search inside a collection
        collection: employees / attendance / etc.
        query: keyword
        """
        results = []

        if collection not in self.data:
            print(f"{collection} not found in database")
            return results

        for item in self.data[collection]:
            for key, value in item.items():
                if query.lower() in str(value).lower():
                    results.append(item)
                    break

        return results

    def pretty_print(self, results):
        """Print results nicely"""
        if not results:
            print("No results found.")
            return

        print(f"\nFound {len(results)} result(s):\n")

        for i, item in enumerate(results, start=1):
            print(f"{i}. ------------------")
            for key, value in item.items():
                print(f"{key}: {value}")
            print()


# 🔥 TEST RUN
if __name__ == "_main_":
    engine = SearchEngine()

    while True:
        print("\n===== SEARCH ENGINE =====")
        collection = input("Enter collection (employees/payroll/etc): ")
        query = input("Search keyword: ")

        results = engine.search(collection, query)
        engine.pretty_print(results)

        again = input("Search again? (y/n): ")
        if again.lower() != "y":
            break