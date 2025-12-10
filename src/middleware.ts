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
    
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // This cookie is set by Firebase Auth on the client side
  const authCookie = request.cookies.get('firebaseAuth');

  if (!authCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authCookie && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for the ones starting with /_next, /api, /static
    '/((?!_next/static|/favicon.ico|api|static).*)',
  ],
};
