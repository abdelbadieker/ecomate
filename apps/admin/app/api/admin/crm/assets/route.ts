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

    if (!client_id) {
      return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('crm_assets')
      .select('*')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false });

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

    const { client_id, type, title, file_url, external_url } = await req.json();

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
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[/api/admin/crm/assets]', error.message);
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
        // Extract the path from the Supabase public URL
        // Typically: https://<project>.supabase.co/storage/v1/object/public/platform-assets/crm/client_id/file.pdf
        const urlParts = asset.file_url.split('/public/platform-assets/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabaseAdmin.storage.from('platform-assets').remove([decodeURIComponent(filePath)]);
        }
      } catch (storageErr) {
        console.error('Error deleting file from storage:', storageErr);
        // Continue to delete from DB even if storage delete fails
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
