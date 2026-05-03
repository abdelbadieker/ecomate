import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[/api/admin/services GET]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { error } = await supabaseAdmin
      .from('services')
      .insert({
        title: body.title,
        description: body.description,
        icon: body.icon,
        image_url: body.image_url,
        order_index: body.order_index,
        is_active: body.is_active !== undefined ? body.is_active : true
      });

    if (error) throw error;
    
    // Log the activity
    await supabaseAdmin.from('activity_logs').insert({
      action: `Created new service: ${body.title}`,
      entity_type: 'service'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[/api/admin/services POST]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
