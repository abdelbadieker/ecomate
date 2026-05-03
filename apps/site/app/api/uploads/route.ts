import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const ALLOWED_BUCKETS = new Set([
  'product-images',
  'creative-references',
  'messages',
]);

function createAuthClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
}

function cleanPath(value: string) {
  return value.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
}

function safeFileName(name: string) {
  const ext = name.includes('.') ? name.split('.').pop() : 'bin';
  const cleanExt = (ext || 'bin').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'bin';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${cleanExt}`;
}

async function ensurePublicBucket(bucket: string) {
  const supabaseAdmin = getSupabaseAdmin();
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
    const authClient = createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = String(formData.get('bucket') || '');
    const path = cleanPath(String(formData.get('path') || `uploads/${user.id}`));

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ error: 'Upload bucket is not allowed' }, { status: 400 });
    }
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 100MB limit' }, { status: 400 });
    }

    await ensurePublicBucket(bucket);

    const supabaseAdmin = getSupabaseAdmin();
    const fileName = safeFileName(file.name);
    const filePath = cleanPath(`${path}/${fileName}`);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl, fileName, path: filePath });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Upload failed';
    console.error('[/api/uploads]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
