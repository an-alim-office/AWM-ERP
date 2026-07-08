import {
  NextRequest,
  NextResponse,
} from "next/server";

/* ============================================================================
   FACE ATTENDANCE API
============================================================================ */

export async function POST(
  req: NextRequest
) {
  try {
    /* ============================================================================
       REQUEST BODY
    ============================================================================ */

    const body = await req.json();

    const {
      employeeId,
      latitude,
      longitude,
      verificationType,
      timestamp,
    } = body;
    
console.log("Attendance:", {
  employeeId,
  latitude,
  longitude,
  verificationType,
  timestamp,
});

    /* ============================================================================
       VALIDATION
    ============================================================================ */

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Employee ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!verificationType) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Face verification failed.",
        },
        {
          status: 401,
        }
      );
    }

    /* ============================================================================
       DEMO EMPLOYEE DATA
    ============================================================================ */

    const employee = {
      id: employeeId,
      name: "Admin User",
      department: "HR Department",
      designation: "Manager",
    };

    /* ============================================================================
       ATTENDANCE LOG
    ============================================================================ */

    const attendanceLog = {
      employeeId,
      employee,
      latitude,
      longitude,
      verificationType,
      timestamp:
        timestamp ||
        new Date().toISOString(),
      status: "CLOCKED_IN",
    };

    console.log(
      "✅ Face Attendance Saved:",
      attendanceLog
    );

    /* ============================================================================
       SUCCESS RESPONSE
    ============================================================================ */

    return NextResponse.json({
      success: true,
      message:
        "Face attendance completed successfully.",
      employee,
      data: attendanceLog,
    });
  } catch (error) {
    console.error(
      "❌ Face Attendance API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================================
   GET API
============================================================================ */

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "Face Attendance API Running Successfully 🚀",
  });
}