import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getAllEmployees } from "./get-employees";

// ==============================
// GET ALL EMPLOYEES
// ==============================
export async function GET() {
  try {
    const employees = await getAllEmployees();

    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    console.error("GET Error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ==============================
// CREATE EMPLOYEE
// ==============================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, department, position, status } = body;

    if (!name || !department || !position) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db("AWM-ERP");

    const result = await db.collection("employees").insertOne({
      name,
      department,
      position,
      status: status || "Active",
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        insertedId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to create employee",
      },
      { status: 500 }
    );
  }
}

// ==============================
// UPDATE EMPLOYEE
// ==============================
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const client = await clientPromise;

    const db = client.db("AWM-ERP");

    await db.collection("employees").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: body.name,
          department: body.department,
          position: body.position,
          status: body.status,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Employee updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to update employee",
      },
      { status: 500 }
    );
  }
}

// ==============================
// DELETE EMPLOYEE
// ==============================
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db("AWM-ERP");

    await db.collection("employees").deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Employee deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to delete employee",
      },
      { status: 500 }
    );
  }
}