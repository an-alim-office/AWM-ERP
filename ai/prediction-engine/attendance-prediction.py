from typing import List, Union


Number = Union[int, float]


def predict_attendance(
    history: List[Number],
    weighted: bool = True,
) -> dict:
    """
    Predict future attendance based on historical attendance data.

    Args:
        history (List[int | float]):
            Attendance history values.
            Example: [85, 90, 88, 92]

        weighted (bool):
            If True → recent values get higher priority.
            If False → normal average prediction.

    Returns:
        dict:
            Attendance prediction summary.
    """

    # Validation
    if not isinstance(history, list):
        raise TypeError("history must be a list")

    if len(history) == 0:
        return {
            "status": "error",
            "message": "No attendance history provided",
            "predicted_attendance": 0,
        }

    for value in history:
        if not isinstance(value, (int, float)):
            raise TypeError("All attendance values must be numeric")

        if value < 0 or value > 100:
            raise ValueError(
                "Attendance values must be between 0 and 100"
            )

    # Prediction Logic
    if weighted and len(history) > 1:
        weights = list(range(1, len(history) + 1))

        weighted_sum = sum(
            value * weight
            for value, weight in zip(history, weights)
        )

        total_weights = sum(weights)

        prediction = weighted_sum / total_weights

    else:
        prediction = sum(history) / len(history)

    # Trend Analysis
    trend = "stable"

    if len(history) >= 2:
        if history[-1] > history[0]:
            trend = "increasing"

        elif history[-1] < history[0]:
            trend = "decreasing"

    return {
        "status": "success",
        "total_records": len(history),
        "average_attendance": round(
            sum(history) / len(history), 2
        ),
        "predicted_attendance": round(prediction, 2),
        "highest_attendance": round(max(history), 2),
        "lowest_attendance": round(min(history), 2),
        "trend": trend,
        "weighted_prediction": weighted,
    }


# Example Usage
if __name__ == "__main__":
    attendance_history = [85, 88, 90, 92, 95]

    result = predict_attendance(
        history=attendance_history,
        weighted=True
    )

    print(result)