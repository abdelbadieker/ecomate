import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, title, description, video_url } = body;

    let result;
    if (id) {
      result = await supabaseAdmin.from('chatbot_demo').update({ title, description, video_url }).eq('id', id);
    } else {
      result = await supabaseAdmin.from('chatbot_demo').insert([{ title, description, video_url }]);
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[/api/admin/chatbot/demo]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
