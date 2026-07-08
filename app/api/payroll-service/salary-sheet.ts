import { NextResponse } from "next/server";

/**
 * =========================================================
 * AWM ERP 2026 - FINAL SALARY SHEET API
 * =========================================================
 * Features:
 * ✅ Net Salary Calculation
 * ✅ Advanced Validation
 * ✅ Safe Financial Processing
 * ✅ Payroll Analytics
 * ✅ Negative Salary Protection
 * ✅ Enterprise-ready Response Structure
 * =========================================================
 */

interface SalarySheetBody {
  workerId: string;
  month?: string;
  baseSalary: number;
  overtimePay: number;
  totalDeductions: number;
}

export async function POST(
  request: Request
) {
  try {
    /**
     * Parse Request Body
     */
    const body: SalarySheetBody =
      await request.json();

    const {
      workerId,
      month,
      baseSalary,
      overtimePay,
      totalDeductions,
    } = body;

    /**
     * =====================================================
     * VALIDATION
     * =====================================================
     */

    if (!workerId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "workerId is required.",
        },
        { status: 400 }
      );
    }

    const numericFields = [
      baseSalary,
      overtimePay,
      totalDeductions,
    ];

    const hasInvalidNumber =
      numericFields.some(
        (value) =>
          typeof value !== "number" ||
          Number.isNaN(value) ||
          value < 0
      );

    if (hasInvalidNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Salary values must be valid positive numbers.",
        },
        { status: 400 }
      );
    }

    /**
     * =====================================================
     * SALARY CALCULATION
     * =====================================================
     */

    const grossSalary =
      baseSalary + overtimePay;

    const calculatedNetSalary =
      grossSalary -
      totalDeductions;

    /**
     * Prevent Negative Salary
     */
    const netSalary =
      calculatedNetSalary < 0
        ? 0
        : calculatedNetSalary;

    /**
     * Payroll Insights
     */
    const overtimeImpact =
      grossSalary > 0
        ? Number(
            (
              (overtimePay /
                grossSalary) *
              100
            ).toFixed(2)
          )
        : 0;

    const deductionImpact =
      grossSalary > 0
        ? Number(
            (
              (totalDeductions /
                grossSalary) *
              100
            ).toFixed(2)
          )
        : 0;

    /**
     * =====================================================
     * FINAL PAYLOAD
     * =====================================================
     */

    const finalSalarySheet = {
      workerId,

      month:
        month || "May-2026",

      earnings: {
        baseSalary,
        overtimePay,
        grossSalary,
      },

      deductions: {
        totalDeductions,
      },

      analytics: {
        overtimeImpactPercentage:
          overtimeImpact,

        deductionImpactPercentage:
          deductionImpact,
      },

      netSalary,

      payrollStatus:
        netSalary > 0
          ? "Generated"
          : "Review Required",

      generatedBy:
        "AWM ERP AI Payroll Engine",

      processedAt:
        new Date().toISOString(),
    };

    /**
     * =====================================================
     * SUCCESS RESPONSE
     * =====================================================
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Final salary sheet generated successfully.",

        data: finalSalarySheet,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "Salary Sheet API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Internal server error while generating salary sheet.",
      },
      { status: 500 }
    );
  }
}
