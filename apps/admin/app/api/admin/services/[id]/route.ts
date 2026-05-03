import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const body = await req.json();
    
    // Build update object
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.icon_type !== undefined) updateData.icon_type = body.icon_type;
    if (body.icon_value !== undefined) updateData.icon_value = body.icon_value;
    if (body.order_index !== undefined) updateData.order_index = body.order_index;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('services')
      .update(updateData)
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        throw new Error('A service with this title already exists.');
      }
      throw error;
    }
    
    await supabaseAdmin.from('activity_logs').insert({
      action: `Updated service: ${body.title || id}`,
      entity_type: 'service'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[/api/admin/services/[id] PUT]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await supabaseAdmin.from('activity_logs').insert({
      action: `Deleted service (ID: ${id})`,
      entity_type: 'service'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[/api/admin/services/[id] DELETE]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
