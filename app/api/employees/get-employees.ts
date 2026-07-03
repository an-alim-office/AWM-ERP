import clientPromise from "@/lib/mongodb";

/**
 * ==========================================
 * AWM ERP 2026 - GET EMPLOYEES SERVICE
 * ==========================================
 * Features:
 * ✅ MongoDB Optimized Queries
 * ✅ Pagination
 * ✅ Search Support
 * ✅ Department Filtering
 * ✅ Status Filtering
 * ✅ Sorting
 * ✅ Type Safety
 * ✅ Clean Error Handling
 * ✅ Production Ready
 * ==========================================
 */

/**
 * ------------------------------------------
 * Employee Status Types
 * ------------------------------------------
 */
export type EmployeeStatus =
  | "Active"
  | "Inactive"
  | "On Leave";

/**
 * ------------------------------------------
 * Employee Interface
 * ------------------------------------------
 */
export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  position: string;
  salary?: number;
  status: EmployeeStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

/**
 * ------------------------------------------
 * Query Options
 * ------------------------------------------
 */
interface GetEmployeesOptions {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: EmployeeStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * ------------------------------------------
 * Format Employee Data
 * ------------------------------------------
 */
function formatEmployee(emp: any): Employee {
  return {
    id: emp._id?.toString() || "",
    name: emp.name || "",
    email: emp.email || "",
    phone: emp.phone || "",
    department: emp.department || "General",
    position: emp.position || "Employee",
    salary: emp.salary || 0,
    status: emp.status || "Active",
    createdAt: emp.createdAt || null,
    updatedAt: emp.updatedAt || null,
  };
}

/**
 * ==========================================
 * GET ALL EMPLOYEES
 * ==========================================
 */
export async function getAllEmployees(
  options: GetEmployeesOptions = {}
) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      department,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    /**
     * Pagination
     */
    const skip = (page - 1) * limit;

    /**
     * MongoDB Connection
     */
    const client = await clientPromise;

    const db = client.db("AWM-ERP");

    const collection =
      db.collection("employees");

    /**
     * Dynamic Query
     */
    const query: any = {};

    /**
     * Search Filter
     */
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          department: {
            $regex: search,
            $options: "i",
          },
        },
        {
          position: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /**
     * Department Filter
     */
    if (department) {
      query.department = department;
    }

    /**
     * Status Filter
     */
    if (status) {
      query.status = status;
    }

    /**
     * Sort Config
     */
    const sortConfig: any = {
      [sortBy]:
        sortOrder === "asc" ? 1 : -1,
    };

    /**
     * Fetch Employees
     */
    const employees = await collection
      .find(query)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit)
      .toArray();

    /**
     * Total Count
     */
    const total =
      await collection.countDocuments(query);

    /**
     * Response
     */
    return {
      success: true,

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(
          total / limit
        ),
        hasNextPage:
          page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },

      filters: {
        search,
        department,
        status,
      },

      data: employees.map(formatEmployee),
    };
  } catch (error: any) {
    console.error(
      "❌ getAllEmployees Error:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to fetch employees."
    );
  }
}

/**
 * ==========================================
 * GET EMPLOYEE BY ID
 * ==========================================
 */
export async function getEmployeeById(
  employeeId: string
) {
  try {
    const client = await clientPromise;

    const db = client.db("AWM-ERP");

    const employee =
      await db
        .collection("employees")
        .findOne({
          id: employeeId,
        });

    if (!employee) {
      return {
        success: false,
        message: "Employee not found",
      };
    }

    return {
      success: true,
      data: formatEmployee(employee),
    };
  } catch (error: any) {
    console.error(
      "❌ getEmployeeById Error:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to fetch employee."
    );
  }
}
