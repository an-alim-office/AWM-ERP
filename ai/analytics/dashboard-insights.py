from __future__ import annotations

import json
from typing import Any, Dict, List, TypedDict


class DashboardData(TypedDict, total=False):
    employees: int
    attendance_rate: float
    total_salary: float
    active_projects: int
    pending_tasks: int


class DashboardResponse(TypedDict):
    employees: int
    attendance_rate: float
    total_salary: float
    active_projects: int
    pending_tasks: int
    alerts: List[str]
    status: str


def generate_dashboard(
    data: DashboardData,
) -> DashboardResponse:
    """
    Generate advanced dashboard analytics.

    Args:
        data:
            Dictionary containing dashboard metrics.

    Returns:
        Optimized dashboard response with alerts.
    """

    if not isinstance(data, dict):
        raise TypeError(
            "data must be a dictionary."
        )

    employees = int(data.get("employees", 0))
    attendance_rate = float(
        data.get("attendance_rate", 0)
    )
    total_salary = float(
        data.get("total_salary", 0)
    )
    active_projects = int(
        data.get("active_projects", 0)
    )
    pending_tasks = int(
        data.get("pending_tasks", 0)
    )

    alerts: List[str] = []

    # Attendance Alert
    if attendance_rate < 70:
        alerts.append(
            "Low attendance rate detected."
        )

    # Salary Alert
    if total_salary > 1_000_000:
        alerts.append(
            "High salary expense detected."
        )

    # Employee Alert
    if employees == 0:
        alerts.append(
            "No employee data available."
        )

    # Pending Task Alert
    if pending_tasks > 20:
        alerts.append(
            "Too many pending tasks."
        )

    status = (
        "critical"
        if len(alerts) >= 3
        else "warning"
        if len(alerts) > 0
        else "healthy"
    )

    return {
        "employees": employees,
        "attendance_rate": round(
            attendance_rate,
            2,
        ),
        "total_salary": round(
            total_salary,
            2,
        ),
        "active_projects": active_projects,
        "pending_tasks": pending_tasks,
        "alerts": alerts,
        "status": status,
    }


# Example Usage
if __name__ == "__main__":
    sample_data = {
        "employees": 120,
        "attendance_rate": 82.5,
        "total_salary": 850000,
        "active_projects": 14,
        "pending_tasks": 8,
    }

    dashboard = generate_dashboard(
        sample_data
    )

    print(
        json.dumps(
            dashboard,
            indent=4,
            ensure_ascii=False,
        )
    )