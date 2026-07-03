import csv
from collections import defaultdict
from datetime import datetime, timedelta

ATTENDANCE_FILE = "attendance.csv"


class AttendancePrediction:
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

    def build_employee_history(self):
        history = defaultdict(list)

        for r in self.records:
            history[r["Name"]].append(r["Date"])

        return history

    def consistency_score(self, dates):
        """Calculate attendance consistency (0-100%)"""
        if not dates:
            return 0

        unique_days = len(set(dates))
        total_span = (
            datetime.strptime(max(dates), "%Y-%m-%d") -
            datetime.strptime(min(dates), "%Y-%m-%d")
        ).days + 1

        if total_span == 0:
            return 100

        return round((unique_days / total_span) * 100, 2)

    def predict_next_day(self):
        history = self.build_employee_history()

        print("\n🔮 Next Day Attendance Prediction:\n")

        for name, dates in history.items():
            score = self.consistency_score(dates)

            if score > 70:
                status = "✅ Likely Present"
            elif score > 40:
                status = "⚠️ Uncertain"
            else:
                status = "❌ Likely Absent"

            print(f"{name} → {status} ({score}%)")

    def risk_employees(self, threshold=40):
        history = self.build_employee_history()

        print("\n⚠️ Risk Employees (Low Attendance):\n")

        for name, dates in history.items():
            score = self.consistency_score(dates)

            if score < threshold:
                print(f"{name} → {score}% consistency")

    def weekly_prediction(self):
        history = self.build_employee_history()

        print("\n📅 Weekly Prediction:\n")

        for name, dates in history.items():
            score = self.consistency_score(dates)

            expected_days = round((score / 100) * 7)

            print(f"{name} → Expected {expected_days}/7 days")

    def run_all(self):
        print("\n===== 🤖 ATTENDANCE PREDICTION =====")
        self.predict_next_day()
        self.weekly_prediction()
        self.risk_employees()


# 🚀 RUN
if __name__ == "_main_":
    predictor = AttendancePrediction()
    predictor.run_all()
