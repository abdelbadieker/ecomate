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
    }
  );
}

export async function GET() {
  try {
    const supabase = createRouteClient();
    
    // Fetch the active billing setting
    const { data, error } = await supabase
      .from('billing_settings')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    // If no active setting, try to find any setting or return default
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ data: data || null });
  } catch (err: any) {
    console.error('[API /billing-settings] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
