// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

// ─────────────────────────────────────────────
// SEO & METADATA CONFIGURATION
// ─────────────────────────────────────────────
export const metadata: Metadata = {
metadataBase: new URL('https://awmerp.com'),

  title: {
    default: "AWM ERP — Enterprise AI-Powered Business Management",
    template: "%s | AWM ERP",
  },

  description:
    "AWM ERP is an intelligent enterprise resource planning system powered by AI. Streamline operations, automate workflows, and scale your business with real-time analytics.",

  applicationName: "AWM ERP",
  generator: "Next.js 15",

  keywords: [
    "AWM ERP",
    "Enterprise ERP",
    "AI ERP System",
    "Business Management Software",
    "Enterprise Resource Planning",
    "AI Business Automation",
    "Dashboard Analytics",
    "SaaS ERP",
    "Cloud ERP Bangladesh",
  ],

  authors: [{ name: "AWM ERP Team", url: "[awmerp.com](https://awmerp.com)" }],
  creator: "AWM ERP",
  publisher: "AWM ERP",

  icons: {
    icon: [
      { url: "/logo/favicon.ico", sizes: "any" },
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/logo/favicon.ico",
    apple: [{ url: "/logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/logo/safari-pinned-tab.svg", color: "#6366f1" }],
  },

  manifest: "/manifest.json",

  openGraph: {
    title: "AWM ERP — Enterprise AI-Powered Business Management",
    description:
      "Intelligent ERP system with AI-driven automation, real-time analytics, and seamless business operations.",
    siteName: "AWM ERP",
    type: "website",
    locale: "en_US",
    url: "[awmerp.com](https://awmerp.com)",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AWM ERP Dashboard Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AWM ERP — Enterprise AI-Powered Business Management",
    description: "Intelligent ERP system with AI-driven automation and real-time analytics.",
    images: ["/twitter-image.jpg"],
    creator: "@awmerp",
    site: "@awmerp",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },

  appleWebApp: {
    capable: true,
    title: "AWM ERP",
    statusBarStyle: "black-translucent",
  },

  category: "Business & Productivity",
  classification: "Enterprise Software",

  referrer: "origin-when-cross-origin",

  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },

  alternates: {
    canonical: "[awmerp.com](https://awmerp.com)",
    languages: {
      "en-US": "[awmerp.com](https://awmerp.com)",
      "bn-BD": "[awmerp.com](https://awmerp.com/bn)",
    },
  },

  other: {
    "msapplication-TileColor": "#6366f1",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#020817",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  colorScheme: "dark light",
  userScalable: true,
};

// ─────────────────────────────────────────────
// JSON-LD STRUCTURED DATA
// ─────────────────────────────────────────────
const structuredData = {
  "@context": "[schema.org](https://schema.org)",
  "@type": "SoftwareApplication",
  name: "AWM ERP",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "[awmerp.com](https://awmerp.com)",
  logo: "[awmerp.com](https://awmerp.com/logo/logo.png)",
  description: "Enterprise AI-powered ERP system for business management and automation.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "150",
  },
  publisher: {
    "@type": "Organization",
    name: "AWM ERP",
    url: "[awmerp.com](https://awmerp.com)",
    logo: {
      "@type": "ImageObject",
      url: "[awmerp.com](https://awmerp.com/logo/logo.png)",
    },
  },
} as const;

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

// ─────────────────────────────────────────────
// ADVANCED LOADING SHELL
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

// ─────────────────────────────────────────────
// ROOT LAYOUT
// ─────────────────────────────────────────────
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="[awmerp.com](https://awmerp.com)" />
        <link rel="dns-prefetch" href="[awmerp.com](https://awmerp.com)" />
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>

      <body className="min-h-[100dvh] bg-surface-950 text-white antialiased selection:bg-brand-400/30 selection:text-brand-50">
        {/* Accessible skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-black/80 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <div className="relative flex min-h-[100dvh] overflow-hidden bg-surface-950">
            {/* Background gradients */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),linear-gradient(135deg,#020817,#07152f,#0f172a)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 z-0 opacity-[0.06] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg xmlns=%27[w3.org](http://www.w3.org/2000/svg%27) width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27/%3E%3C/filter%3E%3Crect width=%27120%27 height=%27120%27 filter=%27url(%23n)%27 opacity=%270.4%27/%3E%3C/svg%3E')",
              }}
            />

            <div className="relative z-10 flex h-full w-full overflow-hidden">
              <aside className="shrink-0">
                <Sidebar />
              </aside>

              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="sticky top-0 z-50 border-b border-white/10 bg-surface-900/80 shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                  <div className="px-4 sm:px-6">
                    <Navbar logoSrc="/logo/logo.png" />
                  </div>
                </header>

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
        </AuthProvider>
      </body>
    </html>
  );
}
