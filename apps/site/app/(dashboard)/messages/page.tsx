'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/storage-utils';
import { MessageSquare, Send, Paperclip, File, Loader2, ArrowUp } from 'lucide-react';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_role: 'client' | 'admin';
  type: 'text' | 'file';
  content: string;
  file_name: string | null;
  file_size: number | null;
  is_read: boolean;
  created_at: string;
};

export default function MessagesPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_messages' }),
      });
      const json = await res.json();
      if (json.data) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unread_count' }),
      });
      const json = await res.json();
      setUnreadCount(json.count ?? 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Initial load: get user, messages, unread count
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    fetchMessages();
    fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
      fetchUnreadCount();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages, fetchUnreadCount]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', type: 'text', content: trimmed }),
      });
      const json = await res.json();
      if (json.data) {
        setMessages((prev) => [...prev, json.data]);
        setInput('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(supabase, file, {
        bucket: 'messages',
        path: 'attachments',
      });

      if (result.error) {
        console.error('Upload failed:', result.error);
        setUploading(false);
        return;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          type: 'file',
          content: result.url,
          file_name: file.name,
          file_size: file.size,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setMessages((prev) => [...prev, json.data]);
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  for (const msg of messages) {
    const msgDate = new Date(msg.created_at).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msg.created_at, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 sm:px-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Messages</h1>
              <p className="text-xs sm:text-sm text-slate-500">Chat with our support team</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-2xl bg-slate-800/40 mb-4">
              <MessageSquare className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">No messages yet. Send a message to get started!</p>
          </div>
        ) : (
          groupedMessages.map((group, gi) => (
            <div key={gi}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-[10px] font-medium text-slate-500 bg-slate-800/60 rounded-full">
                  {formatDate(group.date)}
                </span>
              </div>

              {/* Messages in group */}
              {group.messages.map((msg) => {
                const isClient = msg.sender_id === userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex mb-3 ${isClient ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl ${
                        isClient
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-slate-800/60 text-slate-200 rounded-bl-md'
                      }`}
                    >
                      {msg.type === 'file' ? (
                        <a
                          href={msg.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2.5 group ${
                            isClient
                              ? 'text-white hover:text-blue-100'
                              : 'text-slate-200 hover:text-white'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                              isClient ? 'bg-blue-500/30' : 'bg-slate-700/60'
                            }`}
                          >
                            <File className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {msg.file_name || 'Attachment'}
                            </p>
                            {msg.file_size && (
                              <p
                                className={`text-[10px] ${
                                  isClient ? 'text-blue-200' : 'text-slate-500'
                                }`}
                              >
                                {formatFileSize(msg.file_size)}
                              </p>
                            )}
                          </div>
                          <ArrowUp className="w-3.5 h-3.5 rotate-45 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                      <p
                        className={`text-[10px] mt-1.5 ${
                          isClient ? 'text-blue-200/60' : 'text-slate-500'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 px-4 py-3 sm:px-6 border-t border-slate-700/50 bg-[#0A1628]">
        <div className="flex items-end gap-2">
          {/* File Attach */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors disabled:opacity-50"
            title="Attach file"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2.5 bg-[#070F1F] border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 resize-none outline-none focus:border-blue-500/50 transition-colors"
              style={{ minHeight: 42, maxHeight: 120 }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 p-2.5 rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background:
                input.trim() && !sending
                  ? 'linear-gradient(135deg, #34d399, #059669)'
                  : 'rgba(51,65,85,0.5)',
            }}
            title="Send message"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {uploading && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Uploading file...</span>
          </div>
        )}
      </div>
    </div>
  );
}
