import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';
const MESSAGE_TYPES = new Set(['text', 'file', 'video', 'link']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MessageRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_role: string;
  content: string;
  type: string;
  file_name: string | null;
  file_size: number | null;
  is_read: boolean;
  created_at: string;
};

async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function assertAdminSession() {
  const session = cookies().get('admin_session')?.value;
  return session === 'authenticated';
}

function isMissingMessagesTable(error: { code?: string; message?: string }) {
  return error.code === 'PGRST205' || /messages/i.test(error.message || '');
}

export async function POST(req: Request) {
  try {
    if (!assertAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readJson(req);
    if (!body || typeof body.action !== 'string') {
      return NextResponse.json({ error: 'Valid action is required' }, { status: 400 });
    }

    if (body.action === 'list_conversations') {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('id, sender_id, receiver_id, sender_role, content, type, is_read, created_at')
        .or(`sender_id.eq.${ADMIN_UUID},receiver_id.eq.${ADMIN_UUID}`)
        .order('created_at', { ascending: false });

      if (error) {
        const status = isMissingMessagesTable(error) ? 503 : 500;
        return NextResponse.json({ error: error.message }, { status });
      }

      const messages = (data || []) as unknown as MessageRow[];
      const convMap = new Map<
        string,
        {
          client_id: string;
          latest_message: string;
          latest_type: string;
          latest_created_at: string;
          unread_count: number;
        }
      >();

      for (const msg of messages) {
        const clientId = msg.sender_id === ADMIN_UUID ? msg.receiver_id : msg.sender_id;

        if (!convMap.has(clientId)) {
          convMap.set(clientId, {
            client_id: clientId,
            latest_message: msg.content,
            latest_type: msg.type,
            latest_created_at: msg.created_at,
            unread_count: 0,
          });
        }

        if (msg.sender_id !== ADMIN_UUID && !msg.is_read) {
          const conv = convMap.get(clientId);
          if (conv) conv.unread_count += 1;
        }
      }

      const clientIds = Array.from(convMap.keys());
      const profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};

      if (clientIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .in('id', clientIds);

        if (profilesError) throw profilesError;

        for (const p of (profiles || []) as { id: string; full_name: string | null; email: string | null }[]) {
          profilesMap[p.id] = { full_name: p.full_name, email: p.email };
        }
      }

      const conversations = Array.from(convMap.values())
        .map((conv) => ({
          client_id: conv.client_id,
          full_name: profilesMap[conv.client_id]?.full_name || null,
          email: profilesMap[conv.client_id]?.email || null,
          latest_message: conv.latest_message,
          latest_type: conv.latest_type,
          latest_created_at: conv.latest_created_at,
          unread_count: conv.unread_count,
        }))
        .sort((a, b) => new Date(b.latest_created_at).getTime() - new Date(a.latest_created_at).getTime());

      return NextResponse.json({ data: conversations });
    }

    if (body.action === 'get_messages') {
      const clientId = typeof body.client_id === 'string' ? body.client_id : '';
      if (!UUID_RE.test(clientId)) {
        return NextResponse.json({ error: 'Valid client_id is required' }, { status: 400 });
      }

      const { data: msgData, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${ADMIN_UUID},receiver_id.eq.${clientId}),and(sender_id.eq.${clientId},receiver_id.eq.${ADMIN_UUID})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        const status = isMissingMessagesTable(error) ? 503 : 500;
        return NextResponse.json({ error: error.message }, { status });
      }

      const { error: updateError } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true } as never)
        .eq('sender_id', clientId)
        .eq('receiver_id', ADMIN_UUID)
        .eq('is_read', false);

      if (updateError) {
        console.error('[messages/get_messages] Error marking as read:', updateError.message);
      }

      return NextResponse.json({ data: msgData || [] });
    }

    if (body.action === 'send') {
      const receiverId = typeof body.receiver_id === 'string' ? body.receiver_id : '';
      const type = typeof body.type === 'string' ? body.type : 'text';
      const content = typeof body.content === 'string' ? body.content.trim() : '';

      if (!UUID_RE.test(receiverId)) {
        return NextResponse.json({ error: 'Valid receiver_id is required' }, { status: 400 });
      }

      if (!MESSAGE_TYPES.has(type)) {
        return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
      }

      if (!content) {
        return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
      }

      const newMessage: Record<string, unknown> = {
        sender_id: ADMIN_UUID,
        receiver_id: receiverId,
        sender_role: 'admin',
        type,
        content,
        is_read: false,
        file_name: typeof body.file_name === 'string' ? body.file_name : null,
        file_size: typeof body.file_size === 'number' ? body.file_size : null,
      };

      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert(newMessage as never)
        .select()
        .single();

      if (error) {
        const status = isMissingMessagesTable(error) ? 503 : 500;
        return NextResponse.json({ error: error.message }, { status });
      }

      return NextResponse.json({ data });
    }

    if (body.action === 'get_clients') {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ data: data || [] });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    console.error('[/api/admin/messages] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
