import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type ModuleItem = {
  title: string;
  href: string;
  description: string;
};

type FishAndRawMaterialDocument = {
  title?: string;
  href?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
};

const COLLECTION_NAME = "fish_and_raw_material_modules";
const PREFIX = "/fish-and-raw-material";

const defaultModules: ModuleItem[] = [
  {
    title: "Export Compliance",
    href: "/fish-and-raw-material/export-compliance",
    description: "Authorize shipments, screen parties, and manage records.",
  },
  {
    title: "Fish Market Price",
    href: "/fish-and-raw-material/fish-market-price",
    description: "Track live market movement and procurement thresholds.",
  },
  {
    title: "Fish Procurement",
    href: "/fish-and-raw-material/fish-procurement",
    description: "Manage purchase orders, supplier sourcing, and receiving.",
  },
  {
    title: "Ice Factory",
    href: "/fish-and-raw-material/ice-factory",
    description: "Monitor ice output, stock, and dispatch readiness.",
  },
  {
    title: "Processing Packaging",
    href: "/fish-and-raw-material/processing-packaging",
    description: "Control processing lines, pack status, and QC holds.",
  },
  {
    title: "Quality Inspection",
    href: "/fish-and-raw-material/quality-inspection",
    description: "Review quality checks and pass, hold, or reject decisions.",
  },
  {
    title: "Raw Material Intake",
    href: "/fish-and-raw-material/raw-material-intake",
    description: "Log incoming lots, weight checks, and intake validation.",
  },
  {
    title: "Raw Material Wastage",
    href: "/fish-and-raw-material/raw-material-wastage",
    description: "Track losses, recovery, and disposal actions.",
  },
  {
    title: "Seasonal Supply",
    href: "/fish-and-raw-material/seasonal-supply",
    description: "Plan seasonal availability and demand gaps.",
  },
  {
    title: "Species Batch",
    href: "/fish-and-raw-material/species-batch",
    description: "Group batches by species, grade, and storage zone.",
  },
  {
    title: "Traceability",
    href: "/fish-and-raw-material/traceability",
    description: "Follow lot movement from source to dispatch.",
  },
  {
    title: "Vendor Network",
    href: "/fish-and-raw-material/vendor-network",
    description: "Review supplier health, ratings, and network coverage.",
  },
  {
    title: "Weighing Grading",
    href: "/fish-and-raw-material/weighing-grading",
    description: "Capture weights, assign grades, and manage review tickets.",
  },
];

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

function isValidHref(href: string) {
  return href.startsWith(PREFIX + "/") && href.length > PREFIX.length + 1;
}

function toModuleItem(item: FishAndRawMaterialDocument): ModuleItem {
  return {
    title: normalizeString(item.title),
    href: normalizeString(item.href),
    description: normalizeString(item.description),
  };
}

async function getModulesCollection() {
  return getCollection<FishAndRawMaterialDocument>(COLLECTION_NAME);
}

async function getDbItems() {
  const collection = await getModulesCollection();
  return collection
    .find(
      { isActive: { $ne: false } },
      { projection: { title: 1, href: 1, description: 1, _id: 0 } }
    )
    .sort({ updatedAt: -1, title: 1 })
    .toArray();
}

function validateModuleBody(body: unknown) {
  const data = body as Partial<ModuleItem> | null;
  const title = normalizeString(data?.title);
  const href = normalizeString(data?.href);
  const description = normalizeString(data?.description);

  if (!title || !href || !description) {
    return { ok: false, message: "title, href, and description are required." };
  }

  if (!isValidHref(href)) {
    return { ok: false, message: `href must start with ${PREFIX}/` };
  }

  return { ok: true, title, href, description };
}

export async function GET() {
  try {
    const dbItems = await getDbItems();

    const unique = new Map<string, ModuleItem>();
    for (const item of dbItems) {
      const normalized = toModuleItem(item);
      if (normalized.title && normalized.href && normalized.description && !unique.has(normalized.href)) {
        unique.set(normalized.href, normalized);
      }
    }

    const modules = unique.size > 0 ? Array.from(unique.values()) : defaultModules;

    return json(
      {
        success: true,
        category: "fish-and-raw-material",
        count: modules.length,
        modules,
        source: unique.size > 0 ? "database" : "default",
        updatedAt: new Date().toISOString(),
      },
      200
    );
  } catch (error) {
    return json(
      {
        success: false,
        message: "Failed to fetch modules.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json(
        {
          success: false,
          message: "Content-Type must be application/json.",
        },
        415
      );
    }

    const body = await request.json();
    const validated = validateModuleBody(body);

    if (!validated.ok) {
      return json(
        {
          success: false,
          message: validated.message,
        },
        400
      );
    }

    const collection = await getModulesCollection();
    const now = new Date();

    const existing = await collection.findOne({
      $or: [{ title: validated.title }, { href: validated.href }],
    });

    if (existing) {
      return json(
        {
          success: false,
          message: "A module with the same title or href already exists.",
        },
        409
      );
    }

    const result = await collection.insertOne({
      title: validated.title,
      href: validated.href,
      description: validated.description,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    return json(
      {
        success: true,
        message: "Module saved successfully.",
        insertedId: result.insertedId,
      },
      201
    );
  } catch (error) {
    return json(
      {
        success: false,
        message: "Invalid JSON body or server error.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
}