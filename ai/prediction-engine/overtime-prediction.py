"""
overtime-prediction.py

Advanced Overtime Prediction System
-----------------------------------
Features:
- Employee overtime analysis
- Weekly & monthly prediction
- Risk detection
- Smart weighted prediction
- Validation & error handling
- Clean production-ready structure
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Union
from statistics import mean
import json


Number = Union[int, float]


@dataclass
class OvertimeRecord:
    employee_id: str
    employee_name: str
    overtime_hours: Number


class OvertimePredictionSystem:
    """
    Advanced overtime prediction and analytics system.
    """

    def __init__(self, records: List[OvertimeRecord]):
        self.records = records

    # -----------------------------
    # Validation
    # -----------------------------
    def validate_records(self) -> None:
        """
        Validate overtime records.
        """

        if not isinstance(self.records, list):
            raise TypeError("records must be a list")

        if not self.records:
            raise ValueError("No overtime records found")

        for record in self.records:
            if not isinstance(record, OvertimeRecord):
                raise TypeError(
                    "All items must be OvertimeRecord objects"
                )

            if record.overtime_hours < 0:
                raise ValueError(
                    f"Invalid overtime hours for {record.employee_name}"
                )

    # -----------------------------
    # Prediction Logic
    # -----------------------------
    def predict_overtime(
        self,
        growth_rate: float = 0.10,
        weeks: int = 4,
    ) -> Dict:
        """
        Predict future overtime hours.
        """

        self.validate_records()

        total_hours = sum(
            record.overtime_hours
            for record in self.records
        )

        avg_hours = mean(
            record.overtime_hours
            for record in self.records
        )

        predicted_hours = total_hours * (
            (1 + growth_rate) ** weeks
        )

        high_risk_employees = [
            record.employee_name
            for record in self.records
            if record.overtime_hours >= 40
        ]

        return {
            "status": "success",
            "total_employees": len(self.records),
            "total_overtime_hours": round(total_hours, 2),
            "average_overtime_hours": round(avg_hours, 2),
            "growth_rate_percent": round(
                growth_rate * 100,
                2,
            ),
            "prediction_weeks": weeks,
            "predicted_overtime_hours": round(
                predicted_hours,
                2,
            ),
            "high_risk_employees": high_risk_employees,
            "risk_level": self.calculate_risk_level(avg_hours),
        }

    # -----------------------------
    # Risk Level Detection
    # -----------------------------
    @staticmethod
    def calculate_risk_level(avg_hours: Number) -> str:
        """
        Detect overtime risk level.
        """

        if avg_hours >= 40:
            return "Critical"

        if avg_hours >= 25:
            return "High"

        if avg_hours >= 15:
            return "Moderate"

        return "Low"

    # -----------------------------
    # Export JSON
    # -----------------------------
    def export_json(
        self,
        filepath: str = "overtime_report.json",
    ) -> str:
        """
        Export overtime records to JSON file.
        """

        data = [
            asdict(record)
            for record in self.records
        ]

        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(
                data,
                file,
                indent=4,
                ensure_ascii=False,
            )

        return filepath


# -----------------------------------
# Example Usage
# -----------------------------------
if __name__ == "__main__":

    overtime_data = [
        OvertimeRecord(
            employee_id="EMP001",
            employee_name="John Doe",
            overtime_hours=18,
        ),

        OvertimeRecord(
            employee_id="EMP002",
            employee_name="Sarah Smith",
            overtime_hours=42,
        ),

        OvertimeRecord(
            employee_id="EMP003",
            employee_name="Michael Brown",
            overtime_hours=27,
        ),

        OvertimeRecord(
            employee_id="EMP004",
            employee_name="Emma Wilson",
            overtime_hours=12,
        ),
    ]

    system = OvertimePredictionSystem(
        overtime_data
    )

    result = system.predict_overtime(
        growth_rate=0.15,
        weeks=6,
    )

    print("\n===== OVERTIME PREDICTION REPORT =====")
    print(json.dumps(result, indent=4))

    exported_file = system.export_json()

    print(f"\nJSON Exported: {exported_file}")