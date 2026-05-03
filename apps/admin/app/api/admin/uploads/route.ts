import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const ALLOWED_BUCKETS = new Set([
  'product-images',
  'creative-references',
  'platform-assets',
  'messages',
  'uploads',
  'creative-briefs',
  'products'
]);

function cleanPath(value: string) {
  return value.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
}

function safeFileName(name: string) {
  const ext = name.includes('.') ? name.split('.').pop() : 'bin';
  const cleanExt = (ext || 'bin').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'bin';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${cleanExt}`;
}

async function ensurePublicBucket(bucket: string) {
  const { error } = await supabaseAdmin.storage.getBucket(bucket);
  if (!error) {
    await supabaseAdmin.storage.updateBucket(bucket, { public: true });
    return;
  }

  await supabaseAdmin.storage.createBucket(bucket, {
    public: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const bucket = String(body.bucket || '');
    const path = cleanPath(String(body.path || 'uploads'));
    const originalFileName = String(body.fileName || 'upload.bin');

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ error: 'Upload bucket is not allowed' }, { status: 400 });
    }

    await ensurePublicBucket(bucket);

    const fileName = safeFileName(originalFileName);
    const filePath = cleanPath(`${path}/${fileName}`);

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to generate signed URL' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      signedUrl: data.signedUrl, 
      token: data.token,
      path: filePath, 
      url: publicUrl,
      fileName 
    });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Failed to create upload URL';
    console.error('[/api/admin/uploads]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
