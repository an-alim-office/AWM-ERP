import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ১. লগইন পেজ বা স্ট্যাটিক অ্যাসেট হলে কোনো বাধা ছাড়াই যেতে দাও
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // ২. কুকি থেকে টোকেন চেক করো
  const token = req.cookies.get("token")?.value;

  // ৩. টোকেন না থাকলে লগইন পেজে পাঠিয়ে দাও
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ৪. টোকেন থাকলে সেটি ভেরিফাই করো
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (error) {
    // টোকেন ইনভ্যালিড হলে লগইন পেজে পাঠিয়ে দাও
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// এটি কোন কোন পাথে কাজ করবে তা নির্ধারণ করে
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};