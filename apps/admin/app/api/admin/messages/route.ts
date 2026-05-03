import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';

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

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // ── LIST CONVERSATIONS ──────────────────────────────────────────────
    if (action === 'list_conversations') {
      // Fetch all messages involving the admin
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('id, sender_id, receiver_id, sender_role, content, type, is_read, created_at')
        .or(`sender_id.eq.${ADMIN_UUID},receiver_id.eq.${ADMIN_UUID}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const messages = (data || []) as unknown as MessageRow[];

      // Group by the other party's ID
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
        const clientId =
          msg.sender_id === ADMIN_UUID ? msg.receiver_id : msg.sender_id;

        if (!convMap.has(clientId)) {
          convMap.set(clientId, {
            client_id: clientId,
            latest_message: msg.content,
            latest_type: msg.type,
            latest_created_at: msg.created_at,
            unread_count: 0,
          });
        }

        // Count unread messages sent BY the client (not by admin)
        if (msg.sender_id !== ADMIN_UUID && !msg.is_read) {
          const conv = convMap.get(clientId)!;
          conv.unread_count += 1;
        }
      }

      // Fetch profile info for all conversation partners
      const clientIds = Array.from(convMap.keys());

      let profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};

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

      // Build final conversation list
      const conversations = Array.from(convMap.values()).map((conv) => ({
        client_id: conv.client_id,
        full_name: profilesMap[conv.client_id]?.full_name || null,
        email: profilesMap[conv.client_id]?.email || null,
        latest_message: conv.latest_message,
        latest_type: conv.latest_type,
        latest_created_at: conv.latest_created_at,
        unread_count: conv.unread_count,
      }));

      // Sort by latest message (most recent first)
      conversations.sort(
        (a, b) =>
          new Date(b.latest_created_at).getTime() -
          new Date(a.latest_created_at).getTime()
      );

      return NextResponse.json({ data: conversations });
    }

    // ── GET MESSAGES ────────────────────────────────────────────────────
    if (action === 'get_messages') {
      const { client_id } = body;

      if (!client_id) {
        return NextResponse.json(
          { error: 'client_id is required' },
          { status: 400 }
        );
      }

      // Fetch all messages between admin and this client
      const { data: msgData, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${ADMIN_UUID},receiver_id.eq.${client_id}),and(sender_id.eq.${client_id},receiver_id.eq.${ADMIN_UUID})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark unread messages from this client as read
      const { error: updateError } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true } as never)
        .eq('sender_id', client_id)
        .eq('receiver_id', ADMIN_UUID)
        .eq('is_read', false);

      if (updateError) {
        console.error('[messages/get_messages] Error marking as read:', updateError.message);
      }

      return NextResponse.json({ data: msgData });
    }

    // ── SEND MESSAGE ────────────────────────────────────────────────────
    if (action === 'send') {
      const { receiver_id, type, content, file_name, file_size } = body;

      if (!receiver_id || !type || !content) {
        return NextResponse.json(
          { error: 'receiver_id, type, and content are required' },
          { status: 400 }
        );
      }

      const newMessage: Record<string, unknown> = {
        sender_id: ADMIN_UUID,
        receiver_id,
        sender_role: 'admin',
        type,
        content,
        is_read: false,
      };

      if (file_name !== undefined) newMessage.file_name = file_name;
      if (file_size !== undefined) newMessage.file_size = file_size;

      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert(newMessage as never)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ data });
    }

    // ── GET CLIENTS ─────────────────────────────────────────────────────
    if (action === 'get_clients') {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (error) throw error;

      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    console.error('[/api/admin/messages] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
