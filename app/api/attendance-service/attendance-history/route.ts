// app/api/attendance/route.ts

import { NextResponse } from "next/server";

type AttendanceRecord = {
  id: string;
  workerId: string;
  name: string;
  department: string;
  date: string;
  status: "Present" | "Absent" | "Late";
  method: "GPS" | "Face" | "QR";
  checkIn: string;
  location: string;
};

type AttendanceResponse = {
  success: boolean;
  total: number;
  summary: {
    present: number;
    absent: number;
    late: number;
    attendanceRate: string;
  };
  data: AttendanceRecord[];
  timestamp: string;
};

export async function GET() {
  try {
    // Dummy Database Records
    const attendance: AttendanceRecord[] =
      [
        {
          id: "1",
          workerId: "W101",
          name: "H.M. Alim Uddin",
          department: "IT",
          date: "2026-05-28",
          status: "Present",
          method: "GPS",
          checkIn: "08:50 AM",
          location: "Head Office",
        },

        {
          id: "2",
          workerId: "W102",
          name: "Rahman",
          department: "HR",
          date: "2026-05-28",
          status: "Present",
          method: "Face",
          checkIn: "09:10 AM",
          location: "Dhaka Branch",
        },

        {
          id: "3",
          workerId: "W103",
          name: "Nusrat Jahan",
          department: "Design",
          date: "2026-05-28",
          status: "Late",
          method: "QR",
          checkIn: "09:45 AM",
          location: "Remote Access",
        },

        {
          id: "4",
          workerId: "W104",
          name: "Rakib Hasan",
          department: "Security",
          date: "2026-05-28",
          status: "Absent",
          method: "GPS",
          checkIn: "--",
          location: "No Check-in",
        },
      ];

    // Summary Calculation
    const present = attendance.filter(
      (item) => item.status === "Present"
    ).length;

    const absent = attendance.filter(
      (item) => item.status === "Absent"
    ).length;

    const late = attendance.filter(
      (item) => item.status === "Late"
    ).length;

    const attendanceRate = (
      (present / attendance.length) *
      100
    ).toFixed(2);

    const response: AttendanceResponse = {
      success: true,

      total: attendance.length,

      summary: {
        present,

        absent,

        late,

        attendanceRate: `${attendanceRate}%`,
      },

      data: attendance,

      timestamp:
        new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,

      headers: {
        "Cache-Control":
          "no-store, max-age=0",
        "Content-Type":
          "application/json",
      },
    });
  } catch (error) {
    console.error(
      "Attendance API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Attendance fetch failed",

        error:
          error instanceof Error
            ? error.message
            : "Unknown Error",

        timestamp:
          new Date().toISOString(),
      },
      {
        status: 500,
      }
    );
  }
}