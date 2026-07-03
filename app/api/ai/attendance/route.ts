// app/api/attendance-ai/route.ts

import { NextRequest, NextResponse } from "next/server";

type AttendanceAnalytics = {
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
  aiPrediction: string;
  anomaliesDetected: number;
  riskLevel: string;
  weeklyTrend: string[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  timestamp: string;
  server: string;
  version: string;
  data: AttendanceAnalytics;
};

const generatePrediction = (
  attendanceRate: number
): string => {
  if (attendanceRate >= 95) {
    return "Excellent attendance expected tomorrow.";
  }

  if (attendanceRate >= 85) {
    return "High attendance expected tomorrow.";
  }

  if (attendanceRate >= 70) {
    return "Moderate attendance expected tomorrow.";
  }

  return "Low attendance trend detected.";
};

const detectRiskLevel = (
  anomalies: number
): string => {
  if (anomalies === 0) {
    return "Low";
  }

  if (anomalies <= 3) {
    return "Medium";
  }

  return "High";
};

export async function GET(
  request: NextRequest
) {
  try {
    // Example AI / Database Values
    const totalEmployees = 50;

    const totalPresent = 45;

    const totalAbsent =
      totalEmployees - totalPresent;

    const anomaliesDetected = 0;

    const attendanceRate = Number(
      (
        (totalPresent / totalEmployees) *
        100
      ).toFixed(2)
    );

    const aiPrediction =
      generatePrediction(attendanceRate);

    const response: ApiResponse = {
      success: true,

      message:
        "Attendance AI API initialized successfully.",

      timestamp: new Date().toISOString(),

      server: "Next.js AI Analytics Engine",

      version: "2.0.0",

      data: {
        totalPresent,

        totalAbsent,

        attendanceRate,

        aiPrediction,

        anomaliesDetected,

        riskLevel: detectRiskLevel(
          anomaliesDetected
        ),

        weeklyTrend: [
          "88%",
          "90%",
          "91%",
          "93%",
          "92%",
          "94%",
          "95%",
        ],
      },
    };

    return NextResponse.json(response, {
      status: 200,

      headers: {
        "Cache-Control":
          "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error(
      "Attendance AI API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Internal Server Error",

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