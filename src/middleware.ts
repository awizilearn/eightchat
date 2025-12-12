import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow requests for static files, fonts, and images
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Assumes files have extensions
  ) {
    return NextResponse.next();
  }
    
  const publicPaths = ['/login', '/signup', '/', '/admin'];
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p));

  // This cookie is set by Firebase Auth on the client side
  const authCookie = request.cookies.get('firebaseAuth');

  if (!authCookie && !isPublicPath) {
     // if the path is not public and there is no auth cookie, redirect to login.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access a public path like login or signup, redirect to home.
  if (authCookie && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
     return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for the ones starting with /_next, /api, /static
    '/((?!_next/static|/favicon.ico|api|static).*)',
  ],
};
