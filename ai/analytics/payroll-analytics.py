from __future__ import annotations

import json
from typing import List, TypedDict


class PayrollRecord(TypedDict):
    name: str
    salary: float


class PayrollSummary(TypedDict):
    total_employees: int
    total_salary: float
    average_salary: float
    highest_salary: float
    lowest_salary: float


def payroll_summary(
    payrolls: List[PayrollRecord],
) -> PayrollSummary:
    """
    Generate payroll statistics summary.

    Args:
        payrolls:
            List of payroll records.

    Returns:
        Payroll analytics summary.

    Raises:
        TypeError:
            If payrolls is not a list.

        ValueError:
            If payroll data is invalid.
    """

    if not isinstance(payrolls, list):
        raise TypeError(
            "payrolls must be a list."
        )

    salaries: List[float] = []

    for index, payroll in enumerate(payrolls):
        if not isinstance(payroll, dict):
            raise ValueError(
                f"Payroll at index {index} must be a dictionary."
            )

        if "salary" not in payroll:
            raise ValueError(
                f"Missing 'salary' field at index {index}."
            )

        salary = payroll["salary"]

        if not isinstance(
            salary,
            (int, float),
        ):
            raise ValueError(
                f"Salary must be numeric at index {index}."
            )

        if salary < 0:
            raise ValueError(
                f"Salary cannot be negative at index {index}."
            )

        salaries.append(float(salary))

    total_employees = len(salaries)

    total_salary = round(sum(salaries), 2)

    average_salary = (
        round(total_salary / total_employees, 2)
        if total_employees > 0
        else 0.0
    )

    highest_salary = (
        round(max(salaries), 2)
        if salaries
        else 0.0
    )

    lowest_salary = (
        round(min(salaries), 2)
        if salaries
        else 0.0
    )

    return {
        "total_employees": total_employees,
        "total_salary": total_salary,
        "average_salary": average_salary,
        "highest_salary": highest_salary,
        "lowest_salary": lowest_salary,
    }


# Example Usage
if __name__ == "__main__":
    sample_payrolls = [
        {
            "name": "John",
            "salary": 50000,
        },
        {
            "name": "Alice",
            "salary": 65000,
        },
        {
            "name": "David",
            "salary": 45000,
        },
    ]

    result = payroll_summary(
        sample_payrolls
    )

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False,
        )
    )