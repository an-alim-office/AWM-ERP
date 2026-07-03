// app/api/ai-suggestions/route.ts

import { NextRequest, NextResponse } from "next/server";

type Employee = {
  id: string;
  name: string;
  department: string;
  position: string;
  skills: string[];
  active: boolean;
};

type SuggestionResponse = {
  success: boolean;
  message: string;
  total: number;
  query: string;
  suggestions: string[];
  timestamp: string;
};

const employees: Employee[] = [
  {
    id: "1",
    name: "Alim Uddin",
    department: "IT",
    position: "Software Developer",
    skills: ["Next.js", "React", "TypeScript"],
    active: true,
  },

  {
    id: "2",
    name: "Ayman Rahman",
    department: "HR",
    position: "HR Manager",
    skills: ["Recruitment", "Management"],
    active: true,
  },

  {
    id: "3",
    name: "Mohammed Ali",
    department: "Operations",
    position: "Supervisor",
    skills: ["Operations", "Leadership"],
    active: true,
  },

  {
    id: "4",
    name: "Nusrat Jahan",
    department: "Design",
    position: "UI/UX Designer",
    skills: ["Figma", "Tailwind CSS"],
    active: true,
  },

  {
    id: "5",
    name: "Rakib Hasan",
    department: "Security",
    position: "System Analyst",
    skills: ["Cyber Security", "Monitoring"],
    active: false,
  },
];

function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

function generateSuggestions(
  query: string
): string[] {
  const normalizedQuery =
    normalizeText(query);

  if (!normalizedQuery) {
    return employees.map(
      (employee) =>
        `${employee.name} • ${employee.department} • ${employee.position}`
    );
  }

  return employees
    .filter((employee) => {
      return (
        employee.name
          .toLowerCase()
          .includes(normalizedQuery) ||
        employee.department
          .toLowerCase()
          .includes(normalizedQuery) ||
        employee.position
          .toLowerCase()
          .includes(normalizedQuery) ||
        employee.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(normalizedQuery)
        )
      );
    })
    .map(
      (employee) =>
        `${employee.name} • ${employee.department} • ${employee.position}`
    );
}

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const query =
      searchParams.get("query") || "";

    const suggestions =
      generateSuggestions(query);

    const response: SuggestionResponse = {
      success: true,

      message:
        suggestions.length > 0
          ? "AI suggestions generated successfully."
          : "No matching employee found.",

      total: suggestions.length,

      query,

      suggestions,

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
      "AI Suggestion API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "AI Suggestions Failed",

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