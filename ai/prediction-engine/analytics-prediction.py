from typing import Union


Number = Union[int, float]


def predict_growth(
    current: Number,
    rate: Number = 0.10,
    periods: int = 1,
    compound: bool = True,
) -> dict:
    """
    Predict future growth based on current value and growth rate.

    Args:
        current (int | float):
            Current amount/value.

        rate (int | float):
            Growth rate (default = 0.10 → 10%).

        periods (int):
            Number of growth periods.

        compound (bool):
            If True → compound growth.
            If False → simple growth.

    Returns:
        dict:
            Growth prediction summary.
    """

    # Validation
    if not isinstance(current, (int, float)):
        raise TypeError("current must be a number")

    if not isinstance(rate, (int, float)):
        raise TypeError("rate must be a number")

    if not isinstance(periods, int):
        raise TypeError("periods must be an integer")

    if periods < 1:
        raise ValueError("periods must be at least 1")

    if current < 0:
        raise ValueError("current cannot be negative")

    # Growth Calculation
    if compound:
        predicted = current * ((1 + rate) ** periods)
    else:
        predicted = current + (current * rate * periods)

    growth_amount = predicted - current

    return {
        "current_value": round(current, 2),
        "growth_rate": round(rate * 100, 2),
        "periods": periods,
        "compound_growth": compound,
        "predicted_value": round(predicted, 2),
        "growth_amount": round(growth_amount, 2),
    }


# Example Usage
if __name__ == "__main__":
    result = predict_growth(
        current=10000,
        rate=0.15,
        periods=3,
        compound=True
    )

    print(result)