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
      .from('crm_imports')
      .select(`
        *,
        client:profiles!client_id (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[/api/admin/crm/imports GET]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_id, file_name, file_url, file_type, total_records } = await req.json();

    if (!client_id || !file_name || !file_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('crm_imports')
      .insert([
        {
          client_id,
          file_name,
          file_url,
          file_type,
          total_records: total_records || 0,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[/api/admin/crm/imports POST]', error.message);
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

    // 1. Fetch the import record first
    const { data: record, error: fetchError } = await supabaseAdmin
      .from('crm_imports')
      .select('file_url')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;

    // 2. Delete file from storage if it exists
    if (record?.file_url) {
      try {
        const urlParts = record.file_url.split('/public/platform-assets/');
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
      .from('crm_imports')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[/api/admin/crm/imports DELETE]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
