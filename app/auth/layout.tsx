// app/(auth)/layout.tsx
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-surface-950 px-4 py-10">
      {/* একই background gradient, dashboard shell-এর ভিজ্যুয়াল consistency বজায় রাখতে —
          কিন্তু Sidebar/Header নেই */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),linear-gradient(135deg,#020817,#07152f,#0f172a)]"
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}