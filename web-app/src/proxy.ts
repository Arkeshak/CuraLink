import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role → default redirect after login
const ROLE_DEFAULTS: Record<string, string> = {
  patient:  '/patient/dashboard',
  doctor:   '/doctor/dashboard',
  nurse:    '/nurse/dashboard',
  admin:    '/admin/dashboard',
  pharmacy: '/pharmacy/scan',
};

// Protected route prefixes → allowed roles
const PROTECTED: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/patient',  roles: ['patient'] },
  { prefix: '/doctor',   roles: ['doctor'] },
  { prefix: '/nurse',    roles: ['nurse'] },
  { prefix: '/admin',    roles: ['admin'] },
  { prefix: '/pharmacy', roles: ['pharmacy', 'admin'] },
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public routes
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/api'];
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith('/api'))) {
    return NextResponse.next();
  }

  // Read JWT from cookie
  const token = req.cookies.get('cl_token')?.value;
  const roleCookie = req.cookies.get('cl_role')?.value;

  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role authorization
  for (const { prefix, roles } of PROTECTED) {
    if (pathname.startsWith(prefix)) {
      if (!roleCookie || !roles.includes(roleCookie)) {
        const defaultPath = roleCookie ? ROLE_DEFAULTS[roleCookie] ?? '/' : '/login';
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = defaultPath;
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|images|icons|sw.js).*)',
  ],
};
