import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // ১. হেডার থেকে টোকেন নেওয়া
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ২. আপনার JWT Secret-কে এনকোড করা (পরিবেশ ভেরিয়েবল থেকে আসবে)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // ৩. 'jose' দিয়ে টোকেন ভেরিফাই করা (এটি Edge Runtime-এ ১০০% কাজ করবে)
    await jwtVerify(token, secret);
    
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// কোন কোন রুটে মিডলওয়্যার চলবে তা নির্ধারণ করা
export const config = {
  matcher: [
    '/api/protected/:path*', // আপনার সুরক্ষিত API রুটগুলো এখানে দিন
  ],
};