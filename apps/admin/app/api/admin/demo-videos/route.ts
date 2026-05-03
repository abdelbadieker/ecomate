import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function assertAdminSession() {
  const session = cookies().get('admin_session')?.value;
  return session === 'authenticated';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionName = searchParams.get('section');
    
    let query = supabaseAdmin.from('demo_videos').select('*');
    if (sectionName) {
      query = query.eq('section_name', sectionName);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!assertAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { section_name, video_url } = body;

    if (!section_name || !video_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert the video for the section
    const { data, error } = await supabaseAdmin
      .from('demo_videos')
      .upsert({ section_name, video_url, created_at: new Date().toISOString() }, { onConflict: 'section_name' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!assertAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('demo_videos')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
