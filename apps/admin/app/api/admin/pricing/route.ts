import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    console.error('[/api/admin/pricing] GET', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // ── Create a new pricing plan ──────────────────────────────────────
    if (action === 'create') {
      const { name, price, currency, period, description, features, is_popular, sort_order } = body;

      if (!name || price === undefined) {
        return NextResponse.json(
          { error: 'Name and price are required' },
          { status: 400 },
        );
      }

      const { data, error } = await supabaseAdmin
        .from('pricing_plans')
        .insert({
          name,
          price,
          currency: currency ?? 'DA',
          period: period ?? 'month',
          description: description ?? null,
          features: features ?? [],
          is_popular: is_popular ?? false,
          sort_order: sort_order ?? 0,
        } as never)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // ── Update an existing pricing plan ────────────────────────────────
    if (action === 'update') {
      const { id, ...fields } = body;

      if (!id) {
        return NextResponse.json(
          { error: 'Plan ID is required' },
          { status: 400 },
        );
      }

      // Build a clean update payload from allowed columns
      const updatePayload: Record<string, unknown> = {};
      if (fields.name !== undefined) updatePayload.name = fields.name;
      if (fields.price !== undefined) updatePayload.price = fields.price;
      if (fields.currency !== undefined) updatePayload.currency = fields.currency;
      if (fields.period !== undefined) updatePayload.period = fields.period;
      if (fields.description !== undefined) updatePayload.description = fields.description;
      if (fields.features !== undefined) updatePayload.features = fields.features;
      if (fields.is_popular !== undefined) updatePayload.is_popular = fields.is_popular;
      if (fields.is_active !== undefined) updatePayload.is_active = fields.is_active;
      if (fields.sort_order !== undefined) updatePayload.sort_order = fields.sort_order;

      updatePayload.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from('pricing_plans')
        .update(updatePayload as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // ── Delete a pricing plan ──────────────────────────────────────────
    if (action === 'delete') {
      const { id } = body;

      if (!id) {
        return NextResponse.json(
          { error: 'Plan ID is required' },
          { status: 400 },
        );
      }

      const { error } = await supabaseAdmin
        .from('pricing_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Plan deleted' });
    }

    // ── Toggle plan active/inactive ────────────────────────────────────
    if (action === 'toggle_active') {
      const { id, is_active } = body;

      if (!id || is_active === undefined) {
        return NextResponse.json(
          { error: 'Plan ID and is_active are required' },
          { status: 400 },
        );
      }

      const { data, error } = await supabaseAdmin
        .from('pricing_plans')
        .update({ is_active, updated_at: new Date().toISOString() } as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    console.error('[/api/admin/pricing] POST', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
