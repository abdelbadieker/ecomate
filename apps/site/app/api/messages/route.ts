import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';

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

export async function POST(request: Request) {
  try {
    const supabase = createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // ── get_messages ──────────────────────────────────────────────
    if (action === 'get_messages') {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${ADMIN_UUID}),and(sender_id.eq.${ADMIN_UUID},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Mark unread messages from admin as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', ADMIN_UUID)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      return NextResponse.json({ data: messages });
    }

    // ── send ──────────────────────────────────────────────────────
    if (action === 'send') {
      const { type = 'text', content, file_name, file_size } = body;

      if (!content && type === 'text') {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
      }

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: ADMIN_UUID,
          sender_role: 'client',
          type,
          content,
          file_name: file_name || null,
          file_size: file_size || null,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: newMessage });
    }

    // ── unread_count ──────────────────────────────────────────────
    if (action === 'unread_count') {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ count: count ?? 0 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[API /messages] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
