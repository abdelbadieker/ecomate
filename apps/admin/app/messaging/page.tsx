'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/storage-utils';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Paperclip,
  Plus,
  Loader2,
  ArrowLeft,
  File,
  Video,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';

interface Conversation {
  client_id: string;
  full_name: string | null;
  email: string | null;
  latest_message: string;
  latest_type: string;
  latest_created_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_role: string;
  type: string;
  content: string;
  file_name?: string | null;
  file_size?: number | null;
  is_read: boolean;
  created_at: string;
}

interface ClientProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function apiCall(action: string, payload: Record<string, unknown> = {}) {
  const res = await fetch('/api/admin/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTimestamp(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getInitial(name: string | null) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function MessagingPage() {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [activeClient, setActiveClient] = useState<{ name: string; email: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // ── Data Fetching ────────────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await apiCall('list_conversations');
      setConversations(data || []);
    } catch (err) {
      console.error('[messaging] Error fetching conversations:', err);
    }
  }, []);

  const fetchMessages = useCallback(async (clientId: string) => {
    try {
      const { data } = await apiCall('get_messages', { client_id: clientId });
      setMessages(data || []);
    } catch (err) {
      console.error('[messaging] Error fetching messages:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      await fetchConversations();
      setLoading(false);
    };
    init();
  }, [fetchConversations]);

  // Poll conversations every 10s
  useEffect(() => {
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Poll messages every 5s when a conversation is open
  useEffect(() => {
    if (!activeClientId) return;
    const interval = setInterval(() => fetchMessages(activeClientId), 5000);
    return () => clearInterval(interval);
  }, [activeClientId, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const openConversation = async (clientId: string, name: string | null, email: string | null) => {
    setActiveClientId(clientId);
    setActiveClient({ name: name || 'Unknown', email: email || '' });
    setMessages([]);
    setMobileShowChat(true);
    await fetchMessages(clientId);
    // Refresh conversations to clear unread badges
    await fetchConversations();
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !activeClientId || sendingMessage) return;
    setSendingMessage(true);
    try {
      const { data: newMsg } = await apiCall('send', {
        receiver_id: activeClientId,
        type: 'text',
        content: messageInput.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setMessageInput('');
      await fetchConversations();
    } catch (err) {
      console.error('[messaging] Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeClientId) return;

    setUploadingFile(true);
    try {
      const supabase = createClient();
      const result = await uploadFile(supabase, file, {
        bucket: 'messages',
        path: 'attachments',
      });

      if (result.error) {
        console.error('[messaging] Upload error:', result.error);
        alert('Upload failed: ' + result.error);
        return;
      }

      const isVideo = file.type.startsWith('video/');
      const { data: newMsg } = await apiCall('send', {
        receiver_id: activeClientId,
        type: isVideo ? 'video' : 'file',
        content: result.url,
        file_name: file.name,
        file_size: file.size,
      });

      setMessages((prev) => [...prev, newMsg]);
      await fetchConversations();
    } catch (err) {
      console.error('[messaging] File upload error:', err);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openNewConversation = async () => {
    setShowNewConversation(true);
    setClientSearch('');
    if (clients.length === 0) {
      setLoadingClients(true);
      try {
        const { data } = await apiCall('get_clients');
        setClients(data || []);
      } catch (err) {
        console.error('[messaging] Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }
    }
  };

  const startConversation = (client: ClientProfile) => {
    setShowNewConversation(false);
    openConversation(client.id, client.full_name, client.email);
  };

  const goBackToList = () => {
    setMobileShowChat(false);
    setActiveClientId(null);
    setActiveClient(null);
    setMessages([]);
  };

  // ── Filtered Data ────────────────────────────────────────────────────────

  const filteredConversations = conversations.filter(
    (c) =>
      (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(
    (c) =>
      (c.full_name || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(clientSearch.toLowerCase())
  );

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="w-8 h-8 border-[3px] border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="text-blue-500 w-10 h-10" />
            Messaging Center
          </h2>
          <p className="text-slate-400 mt-1 font-medium">
            Real-time conversations with your clients.
          </p>
        </div>
        <div className="flex gap-4">
          {conversations.reduce((sum, c) => sum + c.unread_count, 0) > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 px-5 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                {conversations.reduce((sum, c) => sum + c.unread_count, 0)} Unread
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-[#0A1628] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[calc(100vh-220px)] min-h-[500px] flex">
        {/* ── LEFT PANEL: Conversation List ──────────────────────────────── */}
        <div
          className={`w-full md:w-[320px] lg:w-[360px] md:min-w-[320px] border-r border-slate-800 flex flex-col ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search + New */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#07101F] border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
              />
            </div>
            <button
              onClick={openNewConversation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Conversation
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm font-medium">No conversations yet</p>
                <p className="text-slate-600 text-xs mt-1">Start a new conversation with a client</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.client_id}
                  onClick={() => openConversation(conv.client_id, conv.full_name, conv.email)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-800/40 ${
                    activeClientId === conv.client_id
                      ? 'bg-blue-600/10 border-r-2 border-r-blue-500'
                      : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {getInitial(conv.full_name)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {conv.full_name || 'Unknown Client'}
                      </span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {formatTime(conv.latest_created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{conv.email}</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs text-slate-400 truncate">
                        {conv.latest_type === 'file'
                          ? 'Attachment'
                          : conv.latest_type === 'video'
                          ? 'Video'
                          : conv.latest_message}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-black rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Chat View ─────────────────────────────────────── */}
        <div
          className={`flex-1 flex flex-col ${
            mobileShowChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeClientId && activeClient ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-4">
                <button
                  onClick={goBackToList}
                  className="md:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {getInitial(activeClient.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{activeClient.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{activeClient.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-slate-500 text-sm font-medium">No messages yet</p>
                    <p className="text-slate-600 text-xs mt-1">
                      Send a message to start the conversation
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.sender_id === ADMIN_UUID;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            isAdmin
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {/* Text message */}
                          {msg.type === 'text' && (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                          )}

                          {/* File attachment */}
                          {msg.type === 'file' && (
                            <a
                              href={msg.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-3 text-sm group ${
                                isAdmin
                                  ? 'text-blue-100 hover:text-white'
                                  : 'text-slate-300 hover:text-white'
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  isAdmin ? 'bg-blue-500/30' : 'bg-slate-700'
                                }`}
                              >
                                <File className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">
                                  {msg.file_name || 'Attachment'}
                                </p>
                                {msg.file_size && (
                                  <p className="text-[10px] opacity-70">
                                    {formatFileSize(msg.file_size)}
                                  </p>
                                )}
                              </div>
                            </a>
                          )}

                          {/* Video attachment */}
                          {msg.type === 'video' && (
                            <a
                              href={msg.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-3 text-sm group ${
                                isAdmin
                                  ? 'text-blue-100 hover:text-white'
                                  : 'text-slate-300 hover:text-white'
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  isAdmin ? 'bg-blue-500/30' : 'bg-slate-700'
                                }`}
                              >
                                <Video className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">
                                  {msg.file_name || 'Video'}
                                </p>
                                {msg.file_size && (
                                  <p className="text-[10px] opacity-70">
                                    {formatFileSize(msg.file_size)}
                                  </p>
                                )}
                              </div>
                            </a>
                          )}

                          {/* Timestamp + read status */}
                          <div
                            className={`flex items-center gap-1.5 mt-2 ${
                              isAdmin ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span
                              className={`text-[10px] ${
                                isAdmin ? 'text-blue-200/60' : 'text-slate-500'
                              }`}
                            >
                              {formatTimestamp(msg.created_at)}
                            </span>
                            {isAdmin && (
                              <span
                                className={`text-[10px] ${
                                  msg.is_read ? 'text-emerald-300' : 'text-blue-200/40'
                                }`}
                              >
                                {msg.is_read ? '  Read' : '  Sent'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="px-5 py-4 border-t border-slate-800">
                <div className="flex items-end gap-3">
                  {/* File attach */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="*/*"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50 shrink-0"
                    title="Attach file"
                  >
                    {uploadingFile ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Paperclip className="w-5 h-5" />
                    )}
                  </button>

                  {/* Text input */}
                  <div className="flex-1 relative">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600 resize-none max-h-32"
                      style={{ minHeight: '44px' }}
                    />
                  </div>

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sendingMessage}
                    className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title="Send message"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state — no conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Select a Conversation</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Choose a conversation from the list or start a new one to begin messaging.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── New Conversation Modal ─────────────────────────────────────────── */}
      {showNewConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0A1628] border border-slate-800 rounded-3xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">New Conversation</h3>
              <p className="text-sm text-slate-400 mt-1">Select a client to start messaging</p>
            </div>

            {/* Search */}
            <div className="px-6 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  placeholder="Search clients..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full bg-[#07101F] border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                  autoFocus
                />
              </div>
            </div>

            {/* Client List */}
            <div className="max-h-72 overflow-y-auto px-3 pb-3">
              {loadingClients ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No clients found
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => startConversation(client)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                      {getInitial(client.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {client.full_name || 'Unnamed Client'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800">
              <button
                onClick={() => setShowNewConversation(false)}
                className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Advisory */}
      <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6 flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 shrink-0">
          <User size={24} />
        </div>
        <div>
          <h4 className="font-bold text-white mb-1">Messaging Protocol</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            All messages sent through this portal are delivered in real-time to the
            client&apos;s dashboard. File attachments are stored securely and
            accessible to both parties. Conversations are automatically refreshed
            every few seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
