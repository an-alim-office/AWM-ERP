import clientPromise from "@/lib/mongodb";

export async function getAllEmployees() {
  try {
    const client = await clientPromise;

    const db = client.db("AWM-ERP");

    const employees = await db
      .collection("employees")
      .find({})
      .toArray();

    const formattedEmployees = employees.map((emp: any) => ({
      id: emp._id.toString(),
      name: emp.name || "",
      department: emp.department || "",
      position: emp.position || "",
      status: emp.status || "Active",
    }));

    return formattedEmployees;
  } catch (error: any) {
    console.error("Database getAllEmployees Error:", error);

    throw new Error(
      error.message || "Failed to fetch employees from database."
    );
  }
}