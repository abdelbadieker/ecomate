import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Generic admin write-proxy. The admin authenticates via the `admin_session`
// cookie (not Supabase Auth), so its browser client is `anon` and is correctly
// blocked by RLS. This server route performs writes with the service-role key
// AFTER verifying the admin session. Tables are whitelisted defensively.
const ALLOWED_TABLES = new Set([
  'platform_contacts', 'customers', 'orders', 'products', 'services',
  'chatbot_responses', 'chatbot_requests', 'chatbot_demo', 'demo_videos',
  'partnerships', 'partner_links', 'billing_settings', 'billing_redirect_settings',
  'reviews', 'activity_logs', 'pricing_plans', 'content_packs', 'fulfillment_tiers',
]);

export async function POST(req: Request) {
  if (cookies().get('admin_session')?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { table, action, values, match } = await req.json();
    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ error: `Table not allowed: ${table}` }, { status: 400 });
    }

    const applyMatch = (q: any) => {
      for (const [k, v] of Object.entries(match || {})) q = q.eq(k, v);
      return q;
    };

    if (action === 'insert') {
      const { data, error } = await supabaseAdmin.from(table).insert(values as never).select();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
    if (action === 'upsert') {
      const { data, error } = await supabaseAdmin.from(table).upsert(values as never).select();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
    if (action === 'update') {
      const { data, error } = await applyMatch(supabaseAdmin.from(table).update(values as never)).select();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
    if (action === 'delete') {
      if (!match || Object.keys(match).length === 0) {
        return NextResponse.json({ error: 'Delete requires a match filter' }, { status: 400 });
      }
      const { error } = await applyMatch(supabaseAdmin.from(table).delete());
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    console.error('[/api/admin/db]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
