import csv
from collections import defaultdict, Counter
from datetime import datetime


ATTENDANCE_FILE = "attendance.csv"


class AnalyticsPrediction:
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

    # 📊 Analytics
    def employee_frequency(self):
        return Counter(r["Name"] for r in self.records)

    def date_frequency(self):
        stats = defaultdict(int)
        for r in self.records:
            stats[r["Date"]] += 1
        return stats

    def attendance_rate(self):
        emp_days = defaultdict(set)

        for r in self.records:
            emp_days[r["Name"]].add(r["Date"])

        all_dates = set(r["Date"] for r in self.records)
        total_days = len(all_dates)

        rates = {}
        for emp, days in emp_days.items():
            rate = (len(days) / total_days) * 100 if total_days else 0
            rates[emp] = round(rate, 2)

        return rates

    # 🤖 Prediction
    def consistency_score(self, dates):
        if not dates:
            return 0

        unique_days = len(set(dates))

        span = (
            datetime.strptime(max(dates), "%Y-%m-%d") -
            datetime.strptime(min(dates), "%Y-%m-%d")
        ).days + 1

        return round((unique_days / span) * 100, 2) if span else 100

    def build_history(self):
        history = defaultdict(list)

        for r in self.records:
            history[r["Name"]].append(r["Date"])

        return history

    def predict_next_day(self):
        history = self.build_history()

        predictions = {}

        for name, dates in history.items():
            score = self.consistency_score(dates)

            if score > 70:
                status = "Present"
            elif score > 40:
                status = "Maybe"
            else:
                status = "Absent"

            predictions[name] = {
                "score": score,
                "status": status
            }

        return predictions

    def weekly_forecast(self):
        predictions = self.predict_next_day()

        forecast = {}

        for name, data in predictions.items():
            expected_days = round((data["score"] / 100) * 7)
            forecast[name] = expected_days

        return forecast

    # 📈 Trend Analysis
    def monthly_trend(self):
        trend = defaultdict(int)

        for r in self.records:
            month = r["Date"][:7]
            trend[month] += 1

        return trend

    def growth_rate(self):
        trend = self.monthly_trend()
        months = sorted(trend.keys())

        growth = {}

        for i in range(1, len(months)):
            prev = trend[months[i - 1]]
            curr = trend[months[i]]

            if prev == 0:
                rate = 100
            else:
                rate = ((curr - prev) / prev) * 100

            growth[months[i]] = round(rate, 2)

        return growth

    # 🚀 Full Report
    def full_report(self):
        print("\n===== 🚀 ANALYTICS + PREDICTION REPORT =====")

        print("\n📊 Attendance Rate:")
        for name, rate in self.attendance_rate().items():
            print(f"{name} → {rate}%")

        print("\n🤖 Next Day Prediction:")
        for name, data in self.predict_next_day().items():
            print(f"{name} → {data['status']} ({data['score']}%)")

        print("\n📅 Weekly Forecast:")
        for name, days in self.weekly_forecast().items():
            print(f"{name} → {days}/7 days")

        print("\n📈 Monthly Trend:")
        for m, count in self.monthly_trend().items():
            print(f"{m} → {count}")

        print("\n📊 Growth Rate:")
        for m, rate in self.growth_rate().items():
            print(f"{m} → {rate}%")

        # Insights
        freq = self.employee_frequency()
        if freq:
            print("\n🔥 Insights:")
            print("Top Performer:", freq.most_common(1)[0])
            print("Least Active:", freq.most_common()[-1])


# 🚀 RUN
if __name__ == "_main_":
    system = AnalyticsPrediction()
    system.full_report()