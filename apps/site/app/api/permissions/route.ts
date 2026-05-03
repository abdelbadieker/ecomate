import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function createRouteClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    },
  );
}

function isMissingPermissionsStore(error: unknown) {
  const err = error as { code?: string; message?: string };
  return (
    err?.code === 'PGRST205' ||
    err?.code === '42P01' ||
    /client_permissions/i.test(err?.message ?? '')
  );
}

export async function GET() {
  try {
    const supabase = createRouteClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: permissions, error } = await supabase
      .from('client_permissions')
      .select('module_name, is_locked')
      .eq('client_id', user.id);

    if (!error) {
      const lockedModules = (permissions || [])
        .filter((permission) => permission.is_locked)
        .map((permission) => permission.module_name);

      return NextResponse.json({
        data: permissions || [],
        lockedModules,
        source: 'client_permissions',
      });
    }

    if (!isMissingPermissionsStore(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('locked_sections')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const lockedModules = Array.isArray(profile?.locked_sections) ? profile.locked_sections : [];
    return NextResponse.json({
      data: lockedModules.map((moduleName: string) => ({ module_name: moduleName, is_locked: true })),
      lockedModules,
      source: 'profiles',
    });
  } catch (err) {
    console.error('[API /permissions] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
