"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
    } else {
      setAllowed(true);
    }
  }, [pathname, router]);

  if (!allowed) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-surface-950 text-slate-300">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}