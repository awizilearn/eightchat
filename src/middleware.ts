import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth'
import { initializeAdminApp } from './firebase/admin-app'
 
const protectedPaths = ['/home', '/discover', '/messages', '/creators', '/dashboard', '/creator', '/settings', '/admin', '/payment'];

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
 
  // Allow requests for API routes, static files, fonts, and images to pass through
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') 
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('__session')?.value;
  
  if (!sessionCookie) {
    if (protectedPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
 
  try {
    const app = initializeAdminApp();
    const decodedClaims = await getAuth(app).verifySessionCookie(sessionCookie, true);
    
    // User is authenticated
    if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname === '/') {
       return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
  } catch (err) {
     // Session cookie is invalid. Force user to login.
     if (protectedPaths.some(p => pathname.startsWith(p))) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        // Clear the invalid cookie
        response.cookies.delete('__session');
        return response;
    }
    return NextResponse.next();
  }
}
 
export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
};
