import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';
const MESSAGE_TYPES = new Set(['text', 'file', 'video', 'link']);

function createRouteClient() {
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

function isMissingMessagesTable(error: { code?: string; message?: string }) {
  return error.code === 'PGRST205' || /messages/i.test(error.message || '');
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readJson(request);
    if (!body || typeof body.action !== 'string') {
      return NextResponse.json({ error: 'Valid action is required' }, { status: 400 });
    }

    if (body.action === 'get_messages') {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${ADMIN_UUID}),and(sender_id.eq.${ADMIN_UUID},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        const status = isMissingMessagesTable(error) ? 503 : 500;
        return NextResponse.json({ error: error.message }, { status });
      }

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', ADMIN_UUID)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      return NextResponse.json({ data: messages || [] });
    }

    if (body.action === 'send') {
      const type = typeof body.type === 'string' ? body.type : 'text';
      const content = typeof body.content === 'string' ? body.content.trim() : '';

      if (!MESSAGE_TYPES.has(type)) {
        return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
      }

      if (!content) {
        return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
      }

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: ADMIN_UUID,
          sender_role: 'client',
          type,
          content,
          file_name: typeof body.file_name === 'string' ? body.file_name : null,
          file_size: typeof body.file_size === 'number' ? body.file_size : null,
        })
        .select()
        .single();

      if (error) {
        const status = isMissingMessagesTable(error) ? 503 : 500;
        return NextResponse.json({ error: error.message }, { status });
      }

      return NextResponse.json({ data: newMessage });
    }

    if (body.action === 'unread_count') {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) {
        const status = isMissingMessagesTable(error) ? 503 : 500;
        return NextResponse.json({ error: error.message }, { status });
      }

      return NextResponse.json({ count: count ?? 0 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[API /messages] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
