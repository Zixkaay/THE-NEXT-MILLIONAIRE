import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /administrator routes except /administrator/login
  if (pathname.startsWith('/administrator') && pathname !== '/administrator/login') {
    const adminSessionString = request.cookies.get('nbp_admin_session')?.value;

    if (!adminSessionString) {
      // Redirect to login page
      const loginUrl = new URL('/administrator/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode user details safely
      const user = JSON.parse(decodeURIComponent(adminSessionString));
      const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

      if (!isAdmin) {
        // Clear cookie and redirect to login
        const response = NextResponse.redirect(new URL('/administrator/login', request.url));
        response.cookies.delete('nbp_admin_session');
        return response;
      }
    } catch (e) {
      // Malformed session, clear cookie and redirect
      const response = NextResponse.redirect(new URL('/administrator/login', request.url));
      response.cookies.delete('nbp_admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/administrator/:path*'],
};
