import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

// POST /api/admin/fulfillment/upload
// Multipart form: file (image)
// Returns: { publicUrl }
export async function POST(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are supported here' }, { status: 400 });
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `fulfillment/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ publicUrl });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Upload failed';
    console.error('[/api/admin/fulfillment/upload]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
