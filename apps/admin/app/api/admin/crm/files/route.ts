import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET /api/admin/crm/files?client_id=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('client_id');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('crm_files')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/crm/files
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_id, file_name, file_url, file_type, file_size } = body;

    if (!client_id || !file_name || !file_url || !file_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('crm_files')
      .insert({
        client_id,
        file_name,
        file_url,
        file_type,
        file_size,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/crm/files?id=...
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Get file info first to delete from storage if needed
    const { data: fileData } = await supabaseAdmin
      .from('crm_files')
      .select('file_url')
      .eq('id', id)
      .single();

    if (fileData?.file_url) {
      const url = new URL(fileData.file_url);
      const path = url.pathname.split('/').slice(-2).join('/'); // Extracts bucket/path
      const bucket = 'platform-assets';
      const filePath = url.pathname.split(`/${bucket}/`)[1];

      if (filePath) {
        await supabaseAdmin.storage.from(bucket).remove([filePath]);
      }
    }

    const { error } = await supabaseAdmin
      .from('crm_files')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
