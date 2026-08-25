// app/(dashboard)/layout.tsx
import { Suspense, type ReactNode } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import AuthGuard from "@/components/AuthGuard";

// ─────────────────────────────────────────────
// LOADING SHELL — মূল app/layout.tsx থেকে অবিকৃত কপি
// ─────────────────────────────────────────────
function LoadingShell() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-4" role="status" aria-label="Loading content">
      <div className="h-12 w-full animate-pulse rounded-lg bg-white/5" />
      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-white/5"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-xl bg-white/5 lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {/* FIX (মূল ফাইলের কমেন্ট অনুযায়ী): h-[100dvh] ব্যবহার করা হয়েছে,
          min-h নয় — যাতে nested h-full/overflow-y-auto descendant-গুলো
          ভাঙে না এবং শুধু <main> স্ক্রল করে, পুরো পেজ নয়। */}
      <div className="relative flex h-[100dvh] overflow-hidden bg-surface-950">
        {/* Background gradients — মূল ফাইল থেকে অবিকৃত */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),linear-gradient(135deg,#020817,#07152f,#0f172a)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27/%3E%3C/filter%3E%3Crect width=%27120%27 height=%27120%27 filter=%27url(%23n)%27 opacity=%270.4%27/%3E%3C/svg%3E')",
          }}
        />

        <div className="relative z-10 flex h-full w-full overflow-hidden">
          {/* Sidebar নিজের fixed <aside> + width-reserving spacer নিজেই render করে */}
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Header নিজের <header> ট্যাগ, background, border, shadow render করে */}
            <Header />

            <main
              id="main-content"
              className="flex-1 overflow-y-auto bg-gradient-to-br from-surface-950/90 via-surface-900/90 to-surface-800/90 p-4 sm:p-6"
            >
              <div className="mx-auto w-full max-w-[1600px]">
                <Suspense fallback={<LoadingShell />}>{children}</Suspense>
              </div>
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}