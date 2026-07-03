import csv
from collections import Counter, defaultdict
from datetime import datetime

ATTENDANCE_FILE = "attendance.csv"


class DashboardInsights:
    def __init__(self, file_path=ATTENDANCE_FILE):
        self.file_path = file_path
        self.records = self.load_data()

    def load_data(self):
        data = []
        try:
            with open(self.file_path, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
        except FileNotFoundError:
            print("❌ attendance.csv not found")
        return data

    def total_attendance(self):
        return len(self.records)

    def unique_employees(self):
        return set(r["Name"] for r in self.records)

    def attendance_frequency(self):
        return Counter(r["Name"] for r in self.records)

    def top_performers(self, limit=5):
        freq = self.attendance_frequency()

        print("\n🔥 Top Performers:\n")
        for name, count in freq.most_common(limit):
            print(f"{name} → {count} days")

    def low_attendance_alert(self, threshold=2):
        freq = self.attendance_frequency()

        print("\n⚠️ Low Attendance Alert:\n")
        for name, count in freq.items():
            if count <= threshold:
                print(f"{name} → Only {count} days")

    def daily_counts(self):
        stats = defaultdict(int)
        for r in self.records:
            stats[r["Date"]] += 1
        return stats

    def weekly_trend(self):
        stats = defaultdict(int)

        for r in self.records:
            date_obj = datetime.strptime(r["Date"], "%Y-%m-%d")
            week = date_obj.strftime("%Y-W%U")
            stats[week] += 1

        print("\n📈 Weekly Trend:\n")
        for w, count in sorted(stats.items()):
            print(f"{w} → {count} উপস্থিত")

    def monthly_trend(self):
        stats = defaultdict(int)

        for r in self.records:
            month = r["Date"][:7]  # YYYY-MM
            stats[month] += 1

        print("\n📊 Monthly Trend:\n")
        for m, count in sorted(stats.items()):
            print(f"{m} → {count} উপস্থিত")

    def today_summary(self):
        today = datetime.now().strftime("%Y-%m-%d")
        today_records = [r for r in self.records if r["Date"] == today]

        print(f"\n📌 Today Summary ({today}):\n")
        print(f"Total উপস্থিত: {len(today_records)}")

        names = [r["Name"] for r in today_records]
        print("Employees:", ", ".join(names) if names else "None")

    def run_all(self):
        print("\n===== 📊 DASHBOARD INSIGHTS =====")
        print(f"Total Records: {self.total_attendance()}")
        print(f"Total Employees: {len(self.unique_employees())}")

        self.today_summary()
        self.top_performers()
        self.low_attendance_alert()
        self.weekly_trend()
        self.monthly_trend()


# 🚀 RUN
if __name__ == "_main_":
    dashboard = DashboardInsights()
    dashboard.run_all()