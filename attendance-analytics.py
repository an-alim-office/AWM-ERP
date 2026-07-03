import csv
from collections import defaultdict, Counter
from datetime import datetime

ATTENDANCE_FILE = "attendance.csv"


class AttendanceAnalytics:
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

    # 📊 Total Stats
    def total_records(self):
        return len(self.records)

    def total_employees(self):
        return len(set(r["Name"] for r in self.records))

    # 👤 Employee-wise count
    def employee_stats(self):
        return Counter(r["Name"] for r in self.records)

    # 📅 Date-wise stats
    def date_stats(self):
        stats = defaultdict(int)
        for r in self.records:
            stats[r["Date"]] += 1
        return stats

    # 📈 Attendance rate
    def attendance_rate(self):
        emp_days = defaultdict(set)

        for r in self.records:
            emp_days[r["Name"]].add(r["Date"])

        rates = {}
        all_dates = set(r["Date"] for r in self.records)

        total_days = len(all_dates)

        for emp, days in emp_days.items():
            rate = (len(days) / total_days) * 100 if total_days else 0
            rates[emp] = round(rate, 2)

        return rates

    # 🔥 Insights
    def insights(self):
        emp_counts = self.employee_stats()

        if not emp_counts:
            print("❌ No data available")
            return

        most_active = emp_counts.most_common(1)[0]
        least_active = emp_counts.most_common()[-1]

        print("\n🔥 Insights:\n")
        print(f"Most Active: {most_active[0]} ({most_active[1]} days)")
        print(f"Least Active: {least_active[0]} ({least_active[1]} days)")

    # 📊 Full Report
    def report(self):
        print("\n===== 📊 ATTENDANCE ANALYTICS =====")

        print(f"\nTotal Records: {self.total_records()}")
        print(f"Total Employees: {self.total_employees()}")

        print("\n👤 Employee Stats:")
        for name, count in self.employee_stats().items():
            print(f"{name} → {count} days")

        print("\n📅 Date-wise Stats:")
        for date, count in self.date_stats().items():
            print(f"{date} → {count} উপস্থিত")

        print("\n📈 Attendance Rate (%):")
        for name, rate in self.attendance_rate().items():
            print(f"{name} → {rate}%")

        self.insights()


# 🚀 RUN
if __name__ == "_main_":
    analytics = AttendanceAnalytics()
    analytics.report()