import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const TABLE = 'content_packs';
const COLS = [
  'name', 'video_count', 'content_price', 'ads_price', 'currency', 'period',
  'description', 'features', 'is_popular', 'sort_order', 'is_active',
];

function authed() {
  return cookies().get('admin_session')?.value === 'authenticated';
}

export async function GET() {
  if (!authed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const payload: Record<string, unknown> = {};
      for (const k of COLS) if (body[k] !== undefined) payload[k] = body[k];
      if (!payload.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      const { data, error } = await supabaseAdmin.from(TABLE).insert(payload as never).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'update' || action === 'toggle_active') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      const payload: Record<string, unknown> = {};
      for (const k of COLS) if (body[k] !== undefined) payload[k] = body[k];
      payload.updated_at = new Date().toISOString();
      const { data, error } = await supabaseAdmin.from(TABLE).update(payload as never).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'delete') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    console.error('[/api/admin/content-packs]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
