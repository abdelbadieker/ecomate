import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function assertAdminSession() {
  const session = cookies().get('admin_session')?.value;
  return session === 'authenticated';
}

export async function GET() {
  try {
    if (!assertAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('billing_settings')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!assertAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    // Ensure only one setting is active at a time if this one is being activated
    if (updateData.is_active) {
      await supabaseAdmin
        .from('billing_settings')
        .update({ is_active: false } as never)
        .neq('id', id || '00000000-0000-0000-0000-000000000000');
    }

    let result;
    if (id) {
      result = await supabaseAdmin
        .from('billing_settings')
        .update({ ...updateData, updated_at: new Date().toISOString() } as never)
        .eq('id', id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('billing_settings')
        .insert({ ...updateData, updated_at: new Date().toISOString() } as never)
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return NextResponse.json({ data: result.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!assertAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('billing_settings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
