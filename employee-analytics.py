import csv
from collections import defaultdict, Counter
from datetime import datetime

ATTENDANCE_FILE = "attendance.csv"


class EmployeeAnalytics:
    def __init__(self, file_path=ATTENDANCE_FILE):
        self.file_path = file_path
        self.data = self.load_data()

    def load_data(self):
        records = []

        try:
            with open(self.file_path, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    records.append(row)
        except FileNotFoundError:
            print("❌ attendance.csv not found")
        except Exception as e:
            print("❌ Error:", e)

        return records

    def total_entries(self):
        return len(self.data)

    def unique_employees(self):
        return set(row["Name"] for row in self.data)

    def attendance_by_date(self):
        stats = defaultdict(list)

        for row in self.data:
            stats[row["Date"]].append(row["Name"])

        return stats

    def daily_report(self):
        stats = self.attendance_by_date()

        print("\n📅 Daily Attendance Report:\n")
        for date, names in stats.items():
            print(f"{date} → {len(names)} উপস্থিত")
            print("   ", ", ".join(names))
            print("-" * 40)

    def top_employees(self, limit=5):
        counter = Counter(row["Name"] for row in self.data)

        print("\n🔥 Top Active Employees:\n")
        for name, count in counter.most_common(limit):
            print(f"{name} → {count} দিন উপস্থিত")

    def today_attendance(self):
        today = datetime.now().strftime("%Y-%m-%d")
        names = [row["Name"] for row in self.data if row["Date"] == today]

        print(f"\n📌 Today ({today}) উপস্থিত:\n")
        if names:
            print(", ".join(names))
        else:
            print("❌ No attendance today")

    def absent_today(self):
        today = datetime.now().strftime("%Y-%m-%d")

        all_emp = self.unique_employees()
        today_emp = set(
            row["Name"] for row in self.data if row["Date"] == today
        )

        absent = all_emp - today_emp

        print(f"\n❌ Absent Today ({today}):\n")
        if absent:
            print(", ".join(absent))
        else:
            print("✅ Everyone present")

    def summary(self):
        print("\n===== 📊 EMPLOYEE ANALYTICS =====")
        print(f"Total Records: {self.total_entries()}")
        print(f"Total Employees: {len(self.unique_employees())}")


# 🚀 RUN
if __name__ == "_main_":
    analytics = EmployeeAnalytics()

    analytics.summary()
    analytics.daily_report()
    analytics.top_employees()
    analytics.today_attendance()
    analytics.absent_today()