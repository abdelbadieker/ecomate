import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertAdminSession() {
  return cookies().get('admin_session')?.value === 'authenticated';
}

async function readJson(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  if (!assertAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'merchants') {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, plan')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] });
  }

  if (action === 'products') {
    const merchantId = searchParams.get('merchantId') || '';
    if (!UUID_RE.test(merchantId)) {
      return NextResponse.json({ error: 'Valid merchantId required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] });
  }

  if (action === 'orders') {
    const merchantId = searchParams.get('merchantId') || '';
    if (!UUID_RE.test(merchantId)) {
      return NextResponse.json({ error: 'Valid merchantId required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!assertAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await readJson(req);
  if (!body || typeof body.action !== 'string') {
    return NextResponse.json({ error: 'Valid action is required' }, { status: 400 });
  }

  if (body.action === 'update_status') {
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    const status = typeof body.status === 'string' ? body.status : '';
    if (!UUID_RE.test(orderId) || !status) {
      return NextResponse.json({ error: 'Valid orderId and status required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'add_product') {
    const merchantId = typeof body.merchantId === 'string' ? body.merchantId : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!UUID_RE.test(merchantId) || !name) {
      return NextResponse.json({ error: 'Valid merchantId and name required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        merchant_id: merchantId,
        name,
        price: Number(body.price) || 0,
        stock: Number(body.stock) || 0,
        image_url: typeof body.image_url === 'string' && body.image_url ? body.image_url : null,
        is_fulfillment: true,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (body.action === 'delete_product') {
    const productId = typeof body.productId === 'string' ? body.productId : '';
    if (!UUID_RE.test(productId)) {
      return NextResponse.json({ error: 'Valid productId required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
