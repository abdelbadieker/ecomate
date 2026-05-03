import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const VIDEO_TYPES = new Set([
  'Short (TikTok/Reels)',
  'Marketing Ad',
  'Product Showcase',
  'Long-form (YouTube)',
]);

const DURATIONS = new Set(['15s', '30s', '60s', '2 minutes']);

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

async function getAuthenticatedEmail() {
  const authClient = createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  return user?.email || null;
}

async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('creative_briefs')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    console.error('[/api/briefs] GET', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const email = await getAuthenticatedEmail();
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readJson(req);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const videoType = typeof body.video_type === 'string' ? body.video_type : '';
    const duration = typeof body.duration === 'string' ? body.duration : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const referenceUrl = typeof body.reference_url === 'string' ? body.reference_url.trim() : '';
    const referenceDescription =
      typeof body.reference_description === 'string' ? body.reference_description.trim() : '';

    if (!VIDEO_TYPES.has(videoType)) {
      return NextResponse.json({ error: 'Invalid video type' }, { status: 400 });
    }

    if (!DURATIONS.has(duration)) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
    }

    if (description.length < 10) {
      return NextResponse.json({ error: 'Brief description must be at least 10 characters' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('creative_briefs')
      .insert({
        video_type: videoType,
        duration,
        description,
        reference_url: referenceUrl || null,
        reference_description: referenceDescription || null,
        user_email: email,
        status: 'Pending',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    console.error('[/api/briefs] POST', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
