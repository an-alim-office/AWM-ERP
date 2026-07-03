// app/api/smart-search/route.ts

import { NextRequest, NextResponse } from "next/server";

type Employee = {
  id: string;
  name: string;
  department: string;
  position: string;
  status: string;
  email: string;
  skills: string[];
};

type SmartSearchResponse = {
  success: boolean;
  message: string;
  count: number;
  searchKey: string;
  data: Employee[];
  timestamp: string;
};

const employees: Employee[] = [
  {
    id: "1",
    name: "Alim Uddin",
    department: "IT",
    position: "Software Developer",
    status: "Active",
    email: "alim@company.com",
    skills: ["Next.js", "React", "MongoDB"],
  },

  {
    id: "2",
    name: "Ayman Rahman",
    department: "HR",
    position: "HR Manager",
    status: "Active",
    email: "ayman@company.com",
    skills: ["Recruitment", "Management"],
  },

  {
    id: "3",
    name: "Mohammed Ali",
    department: "Operations",
    position: "Supervisor",
    status: "On Leave",
    email: "mohammed@company.com",
    skills: ["Operations", "Leadership"],
  },

  {
    id: "4",
    name: "Nusrat Jahan",
    department: "Design",
    position: "UI/UX Designer",
    status: "Active",
    email: "nusrat@company.com",
    skills: ["Figma", "Tailwind CSS"],
  },

  {
    id: "5",
    name: "Rakib Hasan",
    department: "Security",
    position: "System Analyst",
    status: "Inactive",
    email: "rakib@company.com",
    skills: ["Cyber Security", "Monitoring"],
  },
];

function normalizeText(
  value: string
): string {
  return value.trim().toLowerCase();
}

function filterEmployees(
  searchKey: string
): Employee[] {
  const key = normalizeText(searchKey);

  return employees.filter((employee) => {
    return (
      employee.name
        .toLowerCase()
        .includes(key) ||

      employee.department
        .toLowerCase()
        .includes(key) ||

      employee.position
        .toLowerCase()
        .includes(key) ||

      employee.status
        .toLowerCase()
        .includes(key) ||

      employee.email
        .toLowerCase()
        .includes(key) ||

      employee.skills.some((skill) =>
        skill.toLowerCase().includes(key)
      )
    );
  });
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const searchKey =
      body?.searchKey?.trim() || "";

    if (!searchKey) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Search key is required.",

          timestamp:
            new Date().toISOString(),
        },
        {
          status: 400,
        }
      );
    }

    const results =
      filterEmployees(searchKey);

    const response: SmartSearchResponse =
      {
        success: true,

        message:
          results.length > 0
            ? "Smart search completed successfully."
            : "No employee found.",

        count: results.length,

        searchKey,

        data: results,

        timestamp:
          new Date().toISOString(),
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
      "Smart Search API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Smart Search Failed",

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