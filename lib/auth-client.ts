// lib/auth-client.ts

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type Session = {
  token: string;
  expiresAt: string | Date;
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = (data?.message || data?.error || "Request failed") as string;
    throw new Error(error);
  }

  return data;
}

// REGISTER
export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
  deviceId?: string | null;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// LOGIN → SEND OTP
export async function apiLoginSendOtp(payload: {
  email: string;
  password: string;
  deviceId?: string | null;
}) {
  const res = await fetch("/api/auth/login/send-otp", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// FORGOT PASSWORD → SEND OTP
export async function apiForgotPasswordSendOtp(payload: {
  email: string;
  deviceId?: string | null;
}) {
  const res = await fetch("/api/auth/forgot-password/send-otp", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// VERIFY OTP (login / registration / forgot_password)
export async function apiVerifyOtp(payload: {
  email: string;
  otp: string;
  type: "registration" | "login" | "forgot_password";
  deviceId?: string | null;
  trustedDevice?: boolean;
}) {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// RESET PASSWORD
export async function apiResetPassword(payload: {
  email: string;
  otp: string;
  newPassword: string;
  deviceId?: string | null;
}) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// VERIFY TOKEN (session)
export async function apiVerifyToken() {
  const res = await fetch("/api/auth/verify-token", {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}

// LOGOUT
export async function apiLogout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(res);
}
