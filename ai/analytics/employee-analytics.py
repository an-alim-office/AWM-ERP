from __future__ import annotations

import json
from typing import List, TypedDict


class Employee(TypedDict):
    name: str
    active: bool


class EmployeeStats(TypedDict):
    total_employees: int
    active: int
    inactive: int
    active_percentage: float
    inactive_percentage: float


def employee_stats(
    employees: List[Employee],
) -> EmployeeStats:
    """
    Generate employee statistics.

    Args:
        employees:
            List of employee records.

    Returns:
        Employee statistics summary.

    Raises:
        TypeError:
            If employees is not a list.

        ValueError:
            If employee data is invalid.
    """

    if not isinstance(employees, list):
        raise TypeError(
            "employees must be a list."
        )

    active = 0
    inactive = 0

    for index, employee in enumerate(employees):
        if not isinstance(employee, dict):
            raise ValueError(
                f"Employee at index {index} must be a dictionary."
            )

        if "active" not in employee:
            raise ValueError(
                f"Missing 'active' field at index {index}."
            )

        if not isinstance(
            employee["active"],
            bool,
        ):
            raise ValueError(
                f"'active' must be boolean at index {index}."
            )

        if employee["active"]:
            active += 1
        else:
            inactive += 1

    total = len(employees)

    active_percentage = (
        round((active / total) * 100, 2)
        if total > 0
        else 0.0
    )

    inactive_percentage = (
        round((inactive / total) * 100, 2)
        if total > 0
        else 0.0
    )

    return {
        "total_employees": total,
        "active": active,
        "inactive": inactive,
        "active_percentage": active_percentage,
        "inactive_percentage": inactive_percentage,
    }


# Example Usage
if __name__ == "__main__":
    sample_employees = [
        {
            "name": "John",
            "active": True,
        },
        {
            "name": "Alice",
            "active": False,
        },
        {
            "name": "David",
            "active": True,
        },
    ]

    result = employee_stats(
        sample_employees
    )

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False,
        )
    )