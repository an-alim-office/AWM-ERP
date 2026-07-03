import { NextResponse } from "next/server";

import { records } from "@/lib/zakat-store";

/* =========================================================
   DELETE RECORD
========================================================= */

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: {
      id: string;
    };
  }
) {
  try {
    const index = records.findIndex(
      (item) => item._id === params.id
    );

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Record not found",
        },
        {
          status: 404,
        }
      );
    }

    records.splice(index, 1);

    return NextResponse.json(
      {
        success: true,
        message:
          "Record deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete record",
      },
      {
        status: 500,
      }
    );
  }
}