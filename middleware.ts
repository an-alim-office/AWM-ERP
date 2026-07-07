import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // কোনো চেক ছাড়াই রিকোয়েস্টটিকে সামনে এগিয়ে দেবে (Bypass All)
  return NextResponse.next();
}

// কোন কোন পাথে মিডলওয়্যার কাজ করবে তা এখানে নির্ধারণ করা যায়, 
// তবে আপাতত এটি সব রিকোয়েস্টকে অ্যালাউ করবে।
export const config = {
  matcher: [
    /*
     * নিচের পাথগুলো বাদে সব পাথে ম্যাচ করবে:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};