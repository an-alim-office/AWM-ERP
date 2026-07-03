"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  BadgeCheck,
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  CloudCog,
  Globe2,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users2,
  Workflow,
} from "lucide-react";

type Branch = {
  id: string;
  name: string;
  region: string;
  employees: number;
  status: "ACTIVE" | "SYNCING";
};

const branches: Branch[] = [
  {
    id: "BR-001",
    name: "Riyadh HQ",
    region: "Saudi Arabia",
    employees: 142,
    status: "ACTIVE",
  },
  {
    id: "BR-002",
    name: "Dhaka Operations",
    region: "Bangladesh",
    employees: 84,
    status: "ACTIVE",
  },
  {
    id: "BR-003",
    name: "Dubai Logistics",
    region: "UAE",
    employees: 36,
    status: "SYNCING",
  },
];

function cn(
  ...classes: (string | undefined | null | false)[]
) {
  return classes.filter(Boolean).join(" ");
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/80 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%)]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-zinc-200/60 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="h-6 w-48 rounded-xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-24 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-12 rounded-2xl bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}

export default function CompanySettingsPage() {
  const [companyName, setCompanyName] = useState(
    "Ayman Workforce Ltd"
  );

  const [email, setEmail] = useState(
    "info@aymanworkforce.com"
  );

  const [phone, setPhone] = useState(
    "+966 50 000 0000"
  );

  const [address, setAddress] = useState(
    "Riyadh, Saudi Arabia"
  );

  const [website, setWebsite] = useState(
    "https://aymanworkforce.com"
  );

  const [taxId, setTaxId] = useState(
    "SA-VAT-993204"
  );

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);

  const [success, setSuccess] = useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      return (
        branch.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        branch.region
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [search]);

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  const handleRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#050816] dark:via-[#0b1220] dark:to-[#040711] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_24%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-500">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise Company Control Center
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Company Settings
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Global enterprise profile management,
                intelligent organization configuration,
                branding governance, and unified operational
                identity orchestration.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Sync Profile
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">
                <ShieldCheck className="h-4 w-4" />
                Enterprise Verified
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Global Branches"
            value="12"
            subtitle="Connected operational centers"
            icon={<Building2 className="h-5 w-5" />}
          />

          <MetricCard
            title="Active Employees"
            value="2,492"
            subtitle="Unified workforce ecosystem"
            icon={<Users2 className="h-5 w-5" />}
          />

          <MetricCard
            title="Cloud Sync"
            value="99.99%"
            subtitle="Realtime enterprise replication"
            icon={<CloudCog className="h-5 w-5" />}
          />

          <MetricCard
            title="Security Integrity"
            value="A+"
            subtitle="Enterprise-grade compliance"
            icon={<LockKeyhole className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Enterprise Profile Configuration
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  AI-optimized organization identity,
                  compliance settings, and global branding
                  configuration.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                Infrastructure synchronized
              </div>
            </div>

            <Suspense fallback={null}>
              {pageLoading ? (
                <div className="mt-6 space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <>
                  {success && (
                    <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />

                      <div>
                        <h4 className="text-sm font-bold">
                          Profile updated successfully
                        </h4>

                        <p className="mt-1 text-xs opacity-90">
                          Enterprise profile configuration
                          has been synchronized across all
                          operational systems.
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleSave}
                    className="mt-6"
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Company Name
                        </label>

                        <div className="relative">
                          <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) =>
                              setCompanyName(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Official Email
                        </label>

                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                              setEmail(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Phone Number
                        </label>

                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="text"
                            value={phone}
                            onChange={(e) =>
                              setPhone(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Tax / VAT ID
                        </label>

                        <div className="relative">
                          <BadgeCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="text"
                            value={taxId}
                            onChange={(e) =>
                              setTaxId(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Company Address
                        </label>

                        <div className="relative">
                          <MapPin className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-zinc-400" />

                          <textarea
                            value={address}
                            onChange={(e) =>
                              setAddress(
                                e.target.value
                              )
                            }
                            rows={4}
                            className="w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 pt-3 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Official Website
                        </label>

                        <div className="relative">
                          <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="url"
                            value={website}
                            onChange={(e) =>
                              setWebsite(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 rounded-[1.8rem] border border-dashed border-cyan-500/20 bg-cyan-500/5 p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                          Enterprise Branding Assets
                        </h4>

                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          Upload logos, invoice branding,
                          signature assets, and enterprise
                          identity visuals.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]"
                        >
                          <ImagePlus className="h-4 w-4" />
                          Upload Logo
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs font-semibold text-cyan-600 transition-all duration-300 hover:-translate-y-0.5 dark:text-cyan-400"
                        >
                          <UploadCloud className="h-4 w-4" />
                          Sync Assets
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <Workflow className="h-4 w-4" />
                        Audit Changes
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving Profile...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Company Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </Suspense>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-500">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Intelligent Organization Sync
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  Enterprise Identity Grid
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Autonomous business identity engine
                  synchronizing operational data, legal
                  branding, invoice infrastructure, and
                  enterprise ecosystem configuration.
                </p>

                <div className="mt-6 rounded-[1.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
                        Global Sync Integrity
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        99.98%
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-500">
                      <Activity className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <Building2 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Connected Branches
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Multi-location operational network
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search branch or region..."
                    className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {filteredBranches.map((branch) => (
                  <div
                    key={branch.id}
                    className="rounded-[1.5rem] border border-zinc-200/70 bg-zinc-50/70 p-4 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold">
                          {branch.name}
                        </h4>

                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {branch.region}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
                          branch.status === "ACTIVE"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {branch.status}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>
                        {branch.employees} Employees
                      </span>

                      <span>{branch.id}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-4 text-center">
                <BellRing className="mx-auto h-5 w-5 text-cyan-500" />

                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                  Enterprise synchronization active
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Live Configuration Events
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Enterprise activity telemetry
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "Global invoice template synchronized",
                    time: "15 seconds ago",
                  },
                  {
                    title:
                      "Company branding assets updated",
                    time: "3 minutes ago",
                  },
                  {
                    title:
                      "Enterprise compliance profile verified",
                    time: "8 minutes ago",
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <div>
                      <h4 className="text-sm font-semibold">
                        {event.title}
                      </h4>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}