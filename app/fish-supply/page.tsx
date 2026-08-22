import Link from "next/link";

const modules = [
  {
    title: "Fish Procurement",
    href: "/fish-supply/procurement",
    desc: "Manage purchase orders, supplier sourcing, and receiving.",
  },
  {
    title: "Raw Material Intake",
    href: "/fish-supply/intake-register",
    desc: "Log incoming lots, weight checks, and intake validation.",
  },
  {
    title: "Depot Collection Points",
    href: "/fish-supply/collection-points",
    desc: "Manage ghats, collection hubs, and field aggregation.",
  },
  {
    title: "Weighing & Grading",
    href: "/fish-supply/weighing-grading",
    desc: "Capture weights, assign grades, and manage review tickets.",
  },
  {
    title: "Cold Storage Management",
    href: "/fish-supply/cold-storage",
    desc: "Monitor temperature zones, capacities, and stock movement.",
  },
  {
    title: "Ice Factory & Stock",
    href: "/fish-supply/ice-stock",
    desc: "Monitor ice output, stock, and dispatch readiness.",
  },
  {
    title: "Species & Batch Tracking",
    href: "/fish-supply/species-batch-tracking",
    desc: "Group batches by species, grade, and storage zone.",
  },
  {
    title: "Quality Inspection",
    href: "/fish-supply/quality-inspection",
    desc: "Review quality checks and pass, hold, or reject decisions.",
  },
  {
    title: "Processing & Packaging",
    href: "/fish-supply/processing-packaging",
    desc: "Control processing lines, pack status, and QC holds.",
  },
  {
    title: "Cold Chain Logistics",
    href: "/fish-supply/cold-chain-logistics",
    desc: "Track refrigerated fleet, route monitoring, and transit logs.",
  },
  {
    title: "Farmer Ledger",
    href: "/fish-supply/farmer-ledger",
    desc: "Manage fisherman accounts, payments, and credit balances.",
  },
  {
    title: "Auction & Bidding",
    href: "/fish-supply/auction-bidding",
    desc: "Organize live auctions, record winning bids, and buyer logs.",
  },
  {
    title: "Raw Material Wastage",
    href: "/fish-supply/wastage-tracking",
    desc: "Track losses, recovery, and disposal actions.",
  },
  {
    title: "Traceability",
    href: "/fish-supply/traceability",
    desc: "Follow lot movement from source to dispatch.",
  },
  {
    title: "Export Compliance",
    href: "/fish-supply/export-compliance",
    desc: "Authorize shipments, screen parties, and manage records.",
  },
  {
    title: "Seasonal Supply",
    href: "/fish-supply/seasonal-planning",
    desc: "Plan seasonal availability and demand gaps.",
  },
  {
    title: "Vendor Network",
    href: "/fish-supply/vendor-network",
    desc: "Review supplier health, ratings, and network coverage.",
  },
  {
    title: "Fish Market Price",
    href: "/fish-supply/market-price-tracking",
    desc: "Track live market movement and procurement thresholds.",
  },
];

export default function FishSupplyDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Fish and Raw Material
        </span>
        <h1 className="text-3xl font-bold text-white mt-1">
          Operations Dashboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Navigate procurement, intake, processing, quality, traceability, and vendor operations from one central hub.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-5 bg-stone-900/40 border border-stone-800 rounded-2xl hover:border-stone-700 transition"
          >
            <div className="pr-4">
              <h3 className="font-semibold text-stone-200 text-sm">
                {mod.title}
              </h3>
              <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                {mod.desc}
              </p>
            </div>
            <Link
              href={mod.href}
              className="px-3 py-1 text-xs font-medium bg-stone-800 text-stone-300 rounded-md hover:bg-stone-700 transition shrink-0"
            >
              Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}