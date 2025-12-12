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
    
  const publicPaths = ['/login', '/complete-profile', '/'];
  const isPublicPath = publicPaths.some((path) => pathname === path);

  // This cookie is set by Firebase Auth on the client side
  const authCookie = request.cookies.get('firebaseAuth');

  if (!authCookie && !isPublicPath) {
     // if the path is not public and there is no auth cookie, redirect to home.
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is logged in and tries to access home, login, or non-new-user complete-profile, redirect to discover.
  if (authCookie && (pathname === '/' || pathname === '/login' || (pathname === '/complete-profile' && !request.nextUrl.searchParams.has('new-user')))) {
     return NextResponse.redirect(new URL('/discover', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for the ones starting with /_next, /api, /static
    '/((?!_next/static|/favicon.ico|api|static).*)',
  ],
};
