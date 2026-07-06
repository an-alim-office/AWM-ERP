import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

export const metadata: Metadata = {
  metadataBase: new URL("https://awm-erp.com"),
  title: {
    default: "AWM ERP",
    template: "%s | AWM ERP",
  },
  description: "Enterprise AI ERP System",
  applicationName: "AWM ERP",
  generator: "Next.js",
  keywords: [
    "AWM ERP",
    "Enterprise ERP",
    "AI ERP System",
    "Business Management",
    "Dashboard",
  ],
  authors: [{ name: "AWM ERP" }],
  creator: "AWM ERP",
  publisher: "AWM ERP",
  icons: {
    icon: "/logo/favicon.ico",
    shortcut: "/logo/favicon.ico",
    apple: "/logo/favicon.ico",
  },
  openGraph: {
    title: "AWM ERP",
    description: "Enterprise AI ERP System",
    siteName: "AWM ERP",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020817",
  colorScheme: "dark light",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

function LoadingShell() {
  return (
    <div className="flex h-full w-full animate-pulse flex-col gap-4 p-4">
      <div className="h-12 w-full rounded-lg bg-white/5" />
      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 rounded-xl bg-white/5" />
        <div className="h-40 rounded-xl bg-white/5" />
        <div className="h-40 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth"
    >
      <body className="min-h-[100dvh] bg-surface-950 text-white antialiased selection:bg-brand-400/30 selection:text-brand-50">
        {/* ACCESSIBILITY: SKIP LINK */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-black/80 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <div className="relative flex min-h-[100dvh] overflow-hidden bg-surface-950">
          {/* PREMIUM BACKGROUND EFFECTS */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),linear-gradient(135deg,#020817,#07152f,#0f172a)]"
          />

          {/* GLOBAL NOISE / DEPTH LAYER */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27/%3E%3C/filter%3E%3Crect width=%27120%27 height=%27120%27 filter=%27url(%23n)%27 opacity=%270.4%27/%3E%3C/svg%3E')",
            }}
          />

          <div className="relative z-10 flex h-full w-full overflow-hidden">
            {/* PREMIUM SIDEBAR */}
            <aside className="shrink-0">
              <Sidebar />
            </aside>

            {/* MAIN WRAPPER */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {/* TOP NAVBAR */}
              <header className="sticky top-0 z-50 border-b border-white/10 bg-surface-900/80 shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <div className="px-4 sm:px-6">
                  <Navbar logoSrc="/logo/logo.png" />
                </div>
              </header>

              {/* MAIN CONTENT */}
              <main
                id="main-content"
                className="flex-1 overflow-y-auto bg-gradient-to-br from-surface-950/90 via-surface-900/90 to-surface-800/90 p-4 sm:p-6"
              >
                <div className="mx-auto w-full max-w-[1600px]">
                  <Suspense fallback={<LoadingShell />}>
                    {children}
                  </Suspense>
                </div>
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}