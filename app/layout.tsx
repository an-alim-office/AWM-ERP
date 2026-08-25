// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/context/AuthContext";

// ─────────────────────────────────────────────
// SEO & METADATA CONFIGURATION — মূল ফাইল থেকে অবিকৃত
// ─────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://awmerp.com"),

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

  authors: [{ name: "AWM ERP Team", url: "https://awmerp.com" }],
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
    url: "https://awmerp.com",
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
    canonical: "https://awmerp.com",
    languages: {
      "en-US": "https://awmerp.com",
      "bn-BD": "https://awmerp.com/bn",
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
// JSON-LD STRUCTURED DATA — মূল ফাইল থেকে অবিকৃত
// ─────────────────────────────────────────────
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AWM ERP",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://awmerp.com",
  logo: "https://awmerp.com/logo/logo.png",
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
    url: "https://awmerp.com",
    logo: {
      "@type": "ImageObject",
      url: "https://awmerp.com/logo/logo.png",
    },
  },
} as const;

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

// ─────────────────────────────────────────────
// ROOT LAYOUT — bare shell; Sidebar/Header/main এখন
// app/(dashboard)/layout.tsx-এর দায়িত্ব, app/(auth)/layout.tsx
// আলাদা isolated shell পায়। এখানে শুধু html/body/AuthProvider।
// ─────────────────────────────────────────────
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://awmerp.com" />
        <link rel="dns-prefetch" href="https://awmerp.com" />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>

      <body className="min-h-[100dvh] bg-surface-950 text-white antialiased selection:bg-brand-400/30 selection:text-brand-50">
        
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-black/80 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          Skip to main content
        </a>

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}