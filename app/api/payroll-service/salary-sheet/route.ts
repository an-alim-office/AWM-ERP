import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATABASE_NAME = "AWM-ERP";
const COLLECTION_NAME = "salary_sheets";

const requiredFields = [
  "Employee ID",
  "Employee Name",
  "Designation",
  "Department",
  "Basic Salary",
  "Payroll Month",
  "Payroll Year",
  "Payroll Status",
];

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateIncomeTax(basicSalary: number) {
  if (basicSalary <= 30000) return 0;
  if (basicSalary <= 100000) return basicSalary * 0.05;
  return basicSalary * 0.1;
}

function applySalaryAutomation(input: Record<string, unknown>) {
  const next = { ...input };

  const basicSalary = toNumber(next["Basic Salary"]);
  const workingDays = toNumber(next["Working Days"]);
  const absentDays = toNumber(next["Absent Days"]);
  const overtimeHours = toNumber(next["Overtime Hours"]);

  const dailyRate = workingDays > 0 ? basicSalary / workingDays : 0;
  const hourlyRate = dailyRate / 8;

  next["House Rent"] = round2(basicSalary * 0.4);
  next["Medical Allowance"] = round2(basicSalary * 0.1);
  next["Conveyance Allowance"] = round2(basicSalary * 0.05);
  next["Provident Fund (PF)"] = round2(basicSalary * 0.05);
  next["Income Tax"] = round2(calculateIncomeTax(basicSalary));
  next["Taxable Income"] = round2(basicSalary);
  next["Overtime Amount"] = round2(overtimeHours * hourlyRate * 1.5);
  next["Absent Deduction"] = round2(absentDays * dailyRate);

  const grossSalary =
    toNumber(next["Basic Salary"]) +
    toNumber(next["House Rent"]) +
    toNumber(next["Medical Allowance"]) +
    toNumber(next["Conveyance Allowance"]);

  const totalEarnings =
    grossSalary +
    toNumber(next["Tiffin Allowance"]) +
    toNumber(next["Mobile Bill Allowance"]) +
    toNumber(next["Project Bonus"]) +
    toNumber(next["Festival Bonus"]) +
    toNumber(next["Performance Bonus"]) +
    toNumber(next["Attendance Bonus"]) +
    toNumber(next["Incentive"]) +
    toNumber(next["Other Allowances"]) +
    toNumber(next["Overtime Amount"]) +
    toNumber(next["Non-Taxable Income"]) +
    toNumber(next["Arrear Salary"]) +
    toNumber(next["Salary Adjustment"]) +
    toNumber(next["Bonus Adjustment"]);

  const totalDeductions =
    toNumber(next["Provident Fund (PF)"]) +
    toNumber(next["Income Tax"]) +
    toNumber(next["Advance Salary Deduction"]) +
    toNumber(next["Loan Deduction"]) +
    toNumber(next["Absent Deduction"]) +
    toNumber(next["Late Attendance Deduction"]) +
    toNumber(next["Other Deductions"]) +
    toNumber(next["Deduction Adjustment"]);

  next["Gross Salary"] = round2(grossSalary);
  next["Total Earnings"] = round2(totalEarnings);
  next["Total Deductions"] = round2(totalDeductions);
  next["Net Salary"] = round2(totalEarnings - totalDeductions);

  return next;
}

function validateSalaryRecord(data: Record<string, unknown>) {
  const errors: Record<string, string> = {};

  requiredFields.forEach((field) => {
    if (!String(data[field] ?? "").trim()) {
      errors[field] = `${field} is required`;
    }
  });

  if (toNumber(data["Basic Salary"]) <= 0) {
    errors["Basic Salary"] = "Basic Salary must be greater than 0";
  }

  const year = toNumber(data["Payroll Year"]);
  if (year < 2000 || year > 2100) {
    errors["Payroll Year"] = "Payroll Year must be between 2000 and 2100";
  }

  const workingDays = toNumber(data["Working Days"]);
  const presentDays = toNumber(data["Present Days"]);
  const absentDays = toNumber(data["Absent Days"]);
  const leaveDays = toNumber(data["Leave Days"]);

  if (workingDays < 0 || presentDays < 0 || absentDays < 0 || leaveDays < 0) {
    errors["Working Days"] = "Days cannot be negative";
  }

  if (workingDays > 0 && presentDays + absentDays + leaveDays > workingDays) {
    errors["Present Days"] =
      "Present + Absent + Leave Days cannot exceed Working Days";
  }

  if (
    String(data["Payroll Status"] ?? "") === "Paid" &&
    !String(data["Payment Method"] ?? "").trim()
  ) {
    errors["Payment Method"] = "Payment Method is required for paid salary";
  }

  return errors;
}

function toClientRecord(document: Record<string, any>) {
  const { _id, ...rest } = document;
  return {
    ...rest,
    _id: String(_id),
    id: String(rest.id || _id),
  };
}

function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      details,
    },
    { status }
  );
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(DATABASE_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    await collection.createIndex(
      {
        "Employee ID": 1,
        "Payroll Month": 1,
        "Payroll Year": 1,
      },
      {
        unique: true,
        name: "unique_employee_payroll_month_year",
        partialFilterExpression: {
          "Employee ID": { $exists: true, $type: "string" },
          "Payroll Month": { $exists: true, $type: "string" },
          "Payroll Year": { $exists: true },
        },
      }
    );
  } catch (error) {
    console.warn("Salary sheet index warning:", error);
  }

  return collection;
}

/*
 GET
 /api/payroll-service/salary-sheet
 /api/payroll-service/salary-sheet?search=rakib&department=HR&status=Paid&month=January&year=2026&page=1&limit=50
*/
export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const department = searchParams.get("department")?.trim();
    const status = searchParams.get("status")?.trim();
    const month = searchParams.get("month")?.trim();
    const year = searchParams.get("year")?.trim();

    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 500), 1), 1000);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { "Employee ID": { $regex: search, $options: "i" } },
        { "Employee Name": { $regex: search, $options: "i" } },
        { Designation: { $regex: search, $options: "i" } },
        { Department: { $regex: search, $options: "i" } },
      ];
    }

    if (department && department !== "All") filter.Department = department;
    if (status && status !== "All") filter["Payroll Status"] = status;
    if (month && month !== "All") filter["Payroll Month"] = month;
    if (year && year !== "All") filter["Payroll Year"] = Number(year);

    const [records, total, summary] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),

      collection.countDocuments(filter),

      collection
        .aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              totalNetSalary: { $sum: "$Net Salary" },
              totalEarnings: { $sum: "$Total Earnings" },
              totalDeductions: { $sum: "$Total Deductions" },
              averageNetSalary: { $avg: "$Net Salary" },
              employeeIds: { $addToSet: "$Employee ID" },
              paidCount: {
                $sum: {
                  $cond: [{ $eq: ["$Payroll Status", "Paid"] }, 1, 0],
                },
              },
              pendingCount: {
                $sum: {
                  $cond: [{ $eq: ["$Payroll Status", "Pending"] }, 1, 0],
                },
              },
              approvedCount: {
                $sum: {
                  $cond: [{ $eq: ["$Payroll Status", "Approved"] }, 1, 0],
                },
              },
              draftCount: {
                $sum: {
                  $cond: [{ $eq: ["$Payroll Status", "Draft"] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalNetSalary: { $ifNull: ["$totalNetSalary", 0] },
              totalEarnings: { $ifNull: ["$totalEarnings", 0] },
              totalDeductions: { $ifNull: ["$totalDeductions", 0] },
              averageNetSalary: { $ifNull: ["$averageNetSalary", 0] },
              totalEmployees: { $size: "$employeeIds" },
              paidCount: 1,
              pendingCount: 1,
              approvedCount: 1,
              draftCount: 1,
            },
          },
        ])
        .toArray(),
    ]);

    return NextResponse.json({
      success: true,
      records: records.map((record) => toClientRecord(record)),
      total,
      page,
      limit,
      summary: summary[0] || {
        totalNetSalary: 0,
        totalEarnings: 0,
        totalDeductions: 0,
        averageNetSalary: 0,
        totalEmployees: 0,
        paidCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        draftCount: 0,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load salary sheets");
  }
}

/*
 POST
 Save Salary Record
*/
export async function POST(request: NextRequest) {
  try {
    const collection = await getCollection();
    const body = await request.json();

    const input =
      body && typeof body === "object" && body.record ? body.record : body;

    const computed = applySalaryAutomation(input || {});
    const errors = validateSalaryRecord(computed);

    if (Object.keys(errors).length) {
      return jsonError("Validation failed", 400, errors);
    }

    const duplicate = await collection.findOne({
      "Employee ID": String(computed["Employee ID"]).trim(),
      "Payroll Month": computed["Payroll Month"],
      "Payroll Year": Number(computed["Payroll Year"]),
    });

    if (duplicate) {
      return jsonError(
        "This employee already has a salary sheet for this payroll month/year",
        409
      );
    }

    const now = new Date();

    const document = {
      ...computed,
      id: String(computed.id || randomUUID()),
      "Employee ID": String(computed["Employee ID"]).trim(),
      "Payroll Year": Number(computed["Payroll Year"]),
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(document);

    return NextResponse.json({
      success: true,
      message: "Salary sheet saved successfully",
      record: toClientRecord(document),
    });
  } catch (error: any) {
    console.error(error);

    if (error?.code === 11000) {
      return jsonError(
        "Duplicate salary sheet: employee/month/year already exists",
        409
      );
    }

    return jsonError("Failed to save salary sheet");
  }
}

/*
 PUT
 Update Salary Record
 /api/payroll-service/salary-sheet?id=recordId
*/
export async function PUT(request: NextRequest) {
  try {
    const collection = await getCollection();
    const { searchParams } = new URL(request.url);

    const body = await request.json();
    const id = searchParams.get("id") || body.id;

    if (!id) {
      return jsonError("Record id is required", 400);
    }

    const input =
      body && typeof body === "object" && body.record ? body.record : body;

    const computed = applySalaryAutomation(input || {});
    const errors = validateSalaryRecord(computed);

    if (Object.keys(errors).length) {
      return jsonError("Validation failed", 400, errors);
    }

    const duplicate = await collection.findOne({
      id: { $ne: id },
      "Employee ID": String(computed["Employee ID"]).trim(),
      "Payroll Month": computed["Payroll Month"],
      "Payroll Year": Number(computed["Payroll Year"]),
    });

    if (duplicate) {
      return jsonError(
        "This employee already has a salary sheet for this payroll month/year",
        409
      );
    }

    const updateDocument = {
      ...computed,
      id,
      "Employee ID": String(computed["Employee ID"]).trim(),
      "Payroll Year": Number(computed["Payroll Year"]),
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { id },
      { $set: updateDocument },
      { returnDocument: "after" }
    );

    if (!result) {
      return jsonError("Salary record not found", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Salary sheet updated successfully",
      record: toClientRecord(result as any),
    });
  } catch (error: any) {
    console.error(error);

    if (error?.code === 11000) {
      return jsonError(
        "Duplicate salary sheet: employee/month/year already exists",
        409
      );
    }

    return jsonError("Failed to update salary sheet");
  }
}

/*
 DELETE
 /api/payroll-service/salary-sheet?id=recordId
 /api/payroll-service/salary-sheet?ids=id1,id2,id3
*/
export async function DELETE(request: NextRequest) {
  try {
    const collection = await getCollection();
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const ids = searchParams
      .get("ids")
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!id && (!ids || ids.length === 0)) {
      return jsonError("Record id is required", 400);
    }

    const result = ids?.length
      ? await collection.deleteMany({ id: { $in: ids } })
      : await collection.deleteOne({ id });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Salary sheet deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to delete salary sheet");
  }
}