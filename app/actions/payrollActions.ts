"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */

import clientPromise from "../../lib/mongodb";

interface PayrollData {
  employeeId?: string;
  employeeName?: string;
  salary?: number;
  bonus?: number;
  overtime?: number;
  deductions?: number;
  paymentStatus?: string;
  month?: string;
  year?: number;
  [key: string]: any;
}

interface SavePayrollResponse {
  success: boolean;
  message: string;
  insertedId?: string;
  data?: any;
}

export async function savePayrollData(
  data: PayrollData
): Promise<SavePayrollResponse> {
  try {
    // Validation
    if (!data || typeof data !== "object") {
      return {
        success: false,
        message: "Invalid payroll data",
      };
    }

    // MongoDB Client
    const client = await clientPromise;

    // Database
    const db = client.db("awm_db");

    // Collection
    const collection = db.collection("payroll");

    // Final Payroll Document
    const payrollDocument = {
      employeeId: data.employeeId || "N/A",

      employeeName: data.employeeName || "Unknown",

      salary: Number(data.salary || 0),

      bonus: Number(data.bonus || 0),

      overtime: Number(data.overtime || 0),

      deductions: Number(data.deductions || 0),

      paymentStatus:
        data.paymentStatus || "pending",

      month: data.month || "Unknown",

      year: data.year || new Date().getFullYear(),

      report: data,

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    // Insert Data
    const result = await collection.insertOne(
      payrollDocument
    );

    // Success Response
    return {
      success: true,

      message:
        "Payroll data saved successfully",

      insertedId: result.insertedId.toString(),

      data: payrollDocument,
    };
  } catch (error: any) {
    console.error(
      "Database Error:",
      error?.message || error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to save payroll data",
    };
  }
}