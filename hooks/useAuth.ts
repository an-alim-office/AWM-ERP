"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/core/auth";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);

    const res = await login(email, password);

    if (res.success && res.token) {
      localStorage.setItem("token", res.token);
      router.push("/");
    } else {
      alert(res.message);
    }

    setLoading(false);
  };

  return { handleLogin, loading };
};