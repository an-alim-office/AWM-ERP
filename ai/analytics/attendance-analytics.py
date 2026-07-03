from __future__ import annotations

import json
from typing import Any, Dict, List, TypedDict


class AttendanceRecord(TypedDict):
    status: str


class AttendanceSummary(TypedDict):
    total_days: int
    present: int
    absent: int
    attendance_rate: float


VALID_STATUSES = {"present", "absent"}


def attendance_summary(
    data: List[AttendanceRecord],
) -> AttendanceSummary:
    """
    Generate attendance statistics.

    Args:
        data: List of attendance records.
              Example:
              [
                  {"status": "present"},
                  {"status": "absent"},
              ]

    Returns:
        Dictionary containing:
        - total_days
        - present
        - absent
        - attendance_rate

    Raises:
        TypeError:
            If data is not a list.

        ValueError:
            If any record is invalid or missing status.
    """

    if not isinstance(data, list):
        raise TypeError(
            "data must be a list of attendance records."
        )

    present = 0
    absent = 0

    for index, record in enumerate(data):
        if not isinstance(record, dict):
            raise ValueError(
                f"Record at index {index} must be a dictionary."
            )

        status = (
            str(record.get("status", ""))
            .strip()
            .lower()
        )

        if status not in VALID_STATUSES:
            raise ValueError(
                f"Invalid status at index {index}: "
                f"'{status}'. Allowed values are "
                f"'present' or 'absent'."
            )

        if status == "present":
            present += 1
        else:
            absent += 1

    total = len(data)

    attendance_rate = (
        round((present / total) * 100, 2)
        if total > 0
        else 0.0
    )

    return {
        "total_days": total,
        "present": present,
        "absent": absent,
        "attendance_rate": attendance_rate,
    }


# Example Usage
if __name__ == "__main__":
    sample_data = [
        {"status": "present"},
        {"status": "absent"},
        {"status": "present"},
        {"status": "present"},
    ]

    summary = attendance_summary(sample_data)

    print(
        json.dumps(
            summary,
            indent=4,
            ensure_ascii=False,
        )
    )