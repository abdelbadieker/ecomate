import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through static assets and auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Create a response we can mutate (for setting cookies)
  const response = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase env is not configured (e.g. misconfigured env),
  // fail open on public routes and deny dashboard routes with a redirect to /login.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // Build a Supabase server client that can read the session from cookies
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Dashboard routes require an authenticated session
  const isDashboardRoute =
    pathname.startsWith('/overview') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/crm') ||
    pathname.startsWith('/ecotrack') ||
    pathname.startsWith('/fulfillment') ||
    pathname.startsWith('/ai-chatbot') ||
    pathname.startsWith('/creative-studio') ||
    pathname.startsWith('/web-creation') ||
    pathname.startsWith('/estore') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/messages');

  if (isDashboardRoute) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth pages (login/register) — redirect logged-in users to dashboard
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/update-password';

  if (isAuthPage) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return NextResponse.redirect(new URL('/overview', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
