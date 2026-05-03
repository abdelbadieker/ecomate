'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { X, Video, MessageSquare, Clock, CheckCircle2, User } from 'lucide-react';
import { uploadFile } from '@/lib/storage-utils';

function createClient() { return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }

type BotResponse = { id: string; trigger_phrase: string; response: string; category: string; is_active: boolean; created_at: string };
type Demo = { id: string; video_url: string; title: string; description: string };
type ChatbotRequest = { id: string; client_id: string; status: 'pending' | 'scheduled' | 'completed'; notes: string | null; created_at: string; profiles: { full_name: string; email: string } };

export default function ChatbotControl() {
  const supabase = createClient();
  const [responses, setResponses] = useState<BotResponse[]>([]);
  const [requests, setRequests] = useState<ChatbotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ trigger_phrase: '', response: '', category: 'General' });
  const fetch_ = async () => { const { data } = await supabase.from('chatbot_responses').select('*').order('created_at', { ascending: false }); setResponses(data || []); setLoading(false); };
  
  const fetchRequests = async () => {
    // Admin uses API route to bypass RLS for fetching requests if needed, but since we are admin, wait, RLS on chatbot_requests:
    // Clients read own chatbot_requests.
    // Admin needs to read all. We must fetch via API.
    const res = await fetch('/api/admin/chatbot/requests');
    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch_(); fetchRequests(); }, []);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const handleSaveNote = async (id: string) => {
    await fetch('/api/admin/chatbot/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes: noteInput })
    });
    setEditingNoteId(null);
    setNoteInput('');
    fetchRequests();
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await fetch('/api/admin/chatbot/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    fetchRequests();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/chatbot/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, is_active: true })
    });
    await supabase.from('activity_logs').insert({ action: `Added chatbot response: "${form.trigger_phrase}"`, entity_type: 'chatbot' });
    setForm({ trigger_phrase: '', response: '', category: 'General' }); setShowForm(false); fetch_();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch('/api/admin/chatbot/responses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !active })
    });
    fetch_();
  };

  const deleteResponse = async (id: string) => {
    if (!confirm('Delete this response?')) return;
    await fetch('/api/admin/chatbot/responses?id=' + id, { method: 'DELETE' });
    fetch_();
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-[3px] border-slate-700 border-t-emerald-400 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold">Chatbot Control</h2><p className="text-slate-400 text-sm mt-1">{responses.filter(r => r.is_active).length} active responses | {requests.filter(r => r.status === 'pending').length} pending requests</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors">+ Add Response</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* Client Setup Requests */}
        <div className="bg-[#0A1628] border border-slate-800 rounded-xl p-6 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-400"/> Setup Requests</h3>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {requests.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No pending setup requests.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className="bg-[#07101F] border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400"/> {req.profiles?.full_name || 'Unknown Client'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{req.profiles?.email}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{new Date(req.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'pending' ? 'bg-amber-400/10 text-amber-400' :
                      req.status === 'scheduled' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-emerald-400/10 text-emerald-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  {req.notes && <p className="text-xs text-slate-400 bg-slate-800/30 p-2 rounded mb-3">"{req.notes}"</p>}
                  
                  {editingNoteId === req.id ? (
                    <div className="mb-3 space-y-2">
                      <input 
                        value={noteInput} 
                        onChange={(e) => setNoteInput(e.target.value)} 
                        placeholder="Add note..." 
                        className="w-full bg-[#07101F] border border-slate-700 rounded px-3 py-1.5 text-xs text-white outline-none" 
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveNote(req.id)} className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                        <button onClick={() => setEditingNoteId(null)} className="text-[10px] bg-slate-700 text-slate-300 px-3 py-1 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingNoteId(req.id); setNoteInput(req.notes || ''); }} className="text-[10px] text-blue-400 hover:underline mb-3">
                      {req.notes ? 'Edit Note' : '+ Add Note'}
                    </button>
                  )}

                  <div className="flex gap-2">
                    {req.status !== 'scheduled' && (
                      <button onClick={() => updateRequestStatus(req.id, 'scheduled')} className="flex-1 py-1.5 text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-colors flex items-center justify-center gap-1"><Clock className="w-3 h-3"/> Schedule</button>
                    )}
                    {req.status !== 'completed' && (
                      <button onClick={() => updateRequestStatus(req.id, 'completed')} className="flex-1 py-1.5 text-xs font-semibold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded transition-colors flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3"/> Complete</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#0A1628] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">New Bot Response</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-slate-400 mb-1 font-medium">Trigger Phrase</label><input value={form.trigger_phrase} onChange={e => setForm({ ...form, trigger_phrase: e.target.value })} placeholder="e.g. pricing" required className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1 font-medium">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm"><option>General</option><option>Sales</option><option>Support</option><option>Logistics</option><option>Billing</option><option>Greeting</option></select></div>
          </div>
          <div><label className="block text-xs text-slate-400 mb-1 font-medium">Response</label><textarea value={form.response} onChange={e => setForm({ ...form, response: e.target.value })} placeholder="The bot will reply with this..." required className="w-full bg-[#07101F] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none text-sm min-h-[80px] resize-y" /></div>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm">Add Response</button>
        </form>
      )}

      <div className="space-y-3">
        {responses.map(r => (
          <div key={r.id} className="bg-[#0A1628] border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold text-blue-400">"{r.trigger_phrase}"</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full">{r.category}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.is_active ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>{r.is_active ? 'Active' : 'Disabled'}</span>
                </div>
                <p className="text-sm text-slate-300">{r.response}</p>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button onClick={() => toggleActive(r.id, r.is_active)} className={`text-xs px-3 py-1.5 rounded-md font-medium ${r.is_active ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-400/10 text-emerald-400'}`}>{r.is_active ? 'Disable' : 'Enable'}</button>
                <button onClick={() => deleteResponse(r.id)} className="text-xs px-3 py-1.5 rounded-md font-medium bg-red-400/10 text-red-400">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
