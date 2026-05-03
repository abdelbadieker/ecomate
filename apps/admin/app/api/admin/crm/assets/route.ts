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

    const { searchParams } = new URL(req.url);
    const client_id = searchParams.get('client_id');

    let query = supabaseAdmin
      .from('crm_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[/api/admin/crm/assets GET]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_id, type, title, file_url, external_url, file_name, mime_type } = await req.json();

    if (!client_id || !type || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('crm_assets')
      .insert([
        {
          client_id,
          type,
          title,
          file_url: type === 'file' ? file_url : null,
          external_url: type === 'link' ? external_url : null,
          file_name,
          mime_type,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[/api/admin/crm/assets POST]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, type, file_url, external_url, file_name, mime_type } = await req.json();

    if (!id || !title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('crm_assets')
      .update({
        title,
        type,
        file_url: type === 'file' ? file_url : null,
        external_url: type === 'link' ? external_url : null,
        file_name: type === 'file' ? file_name : null,
        mime_type: type === 'file' ? mime_type : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[/api/admin/crm/assets PUT]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // 1. Fetch the asset first to check if there is a file to delete
    const { data: asset, error: fetchError } = await supabaseAdmin
      .from('crm_assets')
      .select('type, file_url')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;

    // 2. If it's a file, delete it from storage
    if (asset && asset.type === 'file' && asset.file_url) {
      try {
        const urlParts = asset.file_url.split('/public/platform-assets/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabaseAdmin.storage.from('platform-assets').remove([decodeURIComponent(filePath)]);
        }
      } catch (storageErr) {
        console.error('Error deleting file from storage:', storageErr);
      }
    }

    // 3. Delete from database
    const { error } = await supabaseAdmin
      .from('crm_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[/api/admin/crm/assets DELETE]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
