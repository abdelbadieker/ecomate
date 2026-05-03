import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('billing_redirect_settings')
      .select('*')
      .order('platform');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[/api/admin/billing-redirect GET]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, platform, redirect_url, is_active } = await req.json();

    if (!id || !platform || !redirect_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If making this one active, we should deactivate others (if it's supposed to be mutually exclusive).
    // The user request says "Toggle active platform" which implies only 1 can be active at a time.
    if (is_active) {
      await supabaseAdmin
        .from('billing_redirect_settings')
        .update({ is_active: false })
        .neq('id', id);
    }

    const { data, error } = await supabaseAdmin
      .from('billing_redirect_settings')
      .update({ redirect_url, is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[/api/admin/billing-redirect PUT]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
