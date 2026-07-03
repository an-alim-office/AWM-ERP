from typing import Union


Number = Union[int, float]


def predict_salary(
    current_salary: Number,
    increment: Number = 0.05,
    years: int = 1,
    bonus: Number = 0,
    compound: bool = True,
) -> dict:
    """
    Advanced Salary Prediction System

    Features:
    - Future salary prediction
    - Compound increment support
    - Bonus calculation
    - Multi-year forecasting
    - Validation & error handling
    """

    # -----------------------------
    # Validation
    # -----------------------------
    if not isinstance(current_salary, (int, float)):
        raise TypeError(
            "current_salary must be a number"
        )

    if not isinstance(increment, (int, float)):
        raise TypeError(
            "increment must be a number"
        )

    if not isinstance(years, int):
        raise TypeError(
            "years must be an integer"
        )

    if not isinstance(bonus, (int, float)):
        raise TypeError(
            "bonus must be a number"
        )

    if current_salary < 0:
        raise ValueError(
            "current_salary cannot be negative"
        )

    if increment < 0:
        raise ValueError(
            "increment cannot be negative"
        )

    if years < 1:
        raise ValueError(
            "years must be at least 1"
        )

    # -----------------------------
    # Prediction Logic
    # -----------------------------
    if compound:
        predicted_salary = current_salary * (
            (1 + increment) ** years
        )

    else:
        predicted_salary = current_salary + (
            current_salary * increment * years
        )

    # Add bonus
    predicted_salary += bonus

    salary_growth = (
        predicted_salary - current_salary
    )

    # Monthly Salary
    monthly_salary = predicted_salary / 12

    # Growth Level
    if increment >= 0.20:
        growth_level = "Excellent"

    elif increment >= 0.10:
        growth_level = "High"

    elif increment >= 0.05:
        growth_level = "Moderate"

    else:
        growth_level = "Low"

    # -----------------------------
    # Final Response
    # -----------------------------
    return {
        "status": "success",
        "current_salary": round(
            current_salary,
            2,
        ),
        "increment_percent": round(
            increment * 100,
            2,
        ),
        "years": years,
        "compound_growth": compound,
        "bonus_added": round(
            bonus,
            2,
        ),
        "predicted_salary": round(
            predicted_salary,
            2,
        ),
        "monthly_estimated_salary": round(
            monthly_salary,
            2,
        ),
        "salary_growth": round(
            salary_growth,
            2,
        ),
        "growth_level": growth_level,
    }


# -----------------------------------
# Example Usage
# -----------------------------------
if __name__ == "__main__":

    result = predict_salary(
        current_salary=50000,
        increment=0.12,
        years=3,
        bonus=5000,
        compound=True,
    )

    print("\n===== SALARY PREDICTION REPORT =====")
    
    for key, value in result.items():
        print(f"{key}: {value}")