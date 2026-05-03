'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  X, 
  Video, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  User, 
  Sparkles, 
  Bot, 
  Trash2, 
  Plus, 
  ChevronRight,
  Search,
  MessageCircle,
  Calendar,
  Settings2
} from 'lucide-react';
import { uploadFile } from '@/lib/storage-utils';

function createClient() { return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }

type BotResponse = { id: string; trigger_phrase: string; response: string; category: string; is_active: boolean; created_at: string };
type ChatbotRequest = { id: string; client_id: string; status: 'pending' | 'scheduled' | 'completed'; notes: string | null; created_at: string; profiles: { full_name: string; email: string } };

export default function ChatbotControl() {
  const supabase = createClient();
  const [responses, setResponses] = useState<BotResponse[]>([]);
  const [requests, setRequests] = useState<ChatbotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'responses'>('requests');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ trigger_phrase: '', response: '', category: 'General' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [respRes, reqRes] = await Promise.all([
        supabase.from('chatbot_responses').select('*').order('created_at', { ascending: false }),
        fetch('/api/admin/chatbot/requests').then(res => res.json())
      ]);
      setResponses(respRes.data || []);
      setRequests(reqRes || []);
    } catch (err) {
      console.error('Error fetching chatbot data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
    fetchData();
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await fetch('/api/admin/chatbot/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    fetchData();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/chatbot/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, is_active: true })
    });
    await supabase.from('activity_logs').insert({ action: `Added chatbot response: "${form.trigger_phrase}"`, entity_type: 'chatbot' });
    setForm({ trigger_phrase: '', response: '', category: 'General' }); 
    setShowForm(false); 
    fetchData();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch('/api/admin/chatbot/responses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !active })
    });
    fetchData();
  };

  const deleteResponse = async (id: string) => {
    if (!confirm('Delete this response?')) return;
    await fetch('/api/admin/chatbot/responses?id=' + id, { method: 'DELETE' });
    fetchData();
  };

  const filteredResponses = responses.filter(r => 
    r.trigger_phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.response.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = requests.filter(r => 
    (r.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.profiles?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-emerald-600/20 rounded-2xl">
              <Bot className="text-emerald-500 w-8 h-8" />
            </div>
            AI Chatbot Control
          </h2>
          <p className="text-slate-400 mt-2 font-medium">Manage setup requests and automated customer responses.</p>
        </div>
        
        <div className="flex bg-[#0A1628] p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            Setup Requests ({requests.length})
          </button>
          <button 
            onClick={() => setActiveTab('responses')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'responses' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            Response Logic ({responses.length})
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pending Setups', value: requests.filter(r => r.status === 'pending').length, color: 'text-amber-400', icon: Clock },
          { label: 'Active Logic', value: responses.filter(r => r.is_active).length, color: 'text-emerald-400', icon: Sparkles },
          { label: 'Completion Rate', value: requests.length ? Math.round((requests.filter(r => r.status === 'completed').length / requests.length) * 100) + '%' : '0%', color: 'text-blue-400', icon: CheckCircle2 }
        ].map((stat, i) => (
          <div key={i} className="bg-[#0A1628] border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-slate-900 border border-slate-800 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-[#0A1628] border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
        <Search className="text-slate-500 ml-2" size={20} />
        <input 
          type="text" 
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full text-sm font-medium"
        />
        {activeTab === 'responses' && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <Plus size={14} /> Add New
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'requests' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.length === 0 ? (
              <div className="col-span-full py-20 bg-[#0A1628]/50 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center text-slate-600">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest opacity-40">No setup requests found</p>
              </div>
            ) : (
              filteredRequests.map(req => (
                <div key={req.id} className="bg-[#0A1628] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${
                    req.status === 'pending' ? 'bg-amber-500' :
                    req.status === 'scheduled' ? 'bg-blue-500' :
                    'bg-emerald-500'
                  }`} />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold">
                        {req.profiles?.full_name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-white truncate">{req.profiles?.full_name || 'Unknown'}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{req.profiles?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      req.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="bg-slate-900/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Calendar size={12} /> Requested: {new Date(req.created_at).toLocaleDateString()}
                    </div>
                    {req.notes && (
                      <div className="text-xs text-slate-400 italic bg-black/20 p-3 rounded-xl border border-white/5">
                        "{req.notes}"
                      </div>
                    )}
                    
                    {editingNoteId === req.id ? (
                      <div className="space-y-2">
                        <textarea 
                          value={noteInput} 
                          onChange={(e) => setNoteInput(e.target.value)} 
                          placeholder="Admin notes..." 
                          className="w-full bg-[#07101F] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none min-h-[60px]" 
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveNote(req.id)} className="flex-1 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Save</button>
                          <button onClick={() => setEditingNoteId(null)} className="flex-1 py-2 bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingNoteId(req.id); setNoteInput(req.notes || ''); }} className="text-[10px] font-black text-blue-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1.5">
                        <Edit size={12} /> {req.notes ? 'Modify Notes' : 'Add Admin Note'}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {req.status === 'pending' && (
                      <button onClick={() => updateRequestStatus(req.id, 'scheduled')} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-600/20">Schedule</button>
                    )}
                    {req.status !== 'completed' && (
                      <button onClick={() => updateRequestStatus(req.id, 'completed')} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-600/20">Complete</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResponses.length === 0 ? (
              <div className="py-20 bg-[#0A1628]/50 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center text-slate-600">
                <Bot size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest opacity-40">No response logic defined</p>
              </div>
            ) : (
              filteredResponses.map(r => (
                <div key={r.id} className="bg-[#0A1628] border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-6 group hover:border-slate-600 transition-all">
                  <div className="w-14 h-14 bg-[#07101F] rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner text-emerald-400 shrink-0">
                    <MessageCircle size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">"{r.trigger_phrase}"</span>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">{r.category}</span>
                      <div className={`w-2 h-2 rounded-full ${r.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{r.response}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleActive(r.id, r.is_active)} 
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${r.is_active ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`}
                    >
                      {r.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      onClick={() => deleteResponse(r.id)} 
                      className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Response Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-[#0A1628] border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">New Bot Logic</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Define how the chatbot should respond to specific triggers.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Trigger Phrase</label>
                  <input 
                    required
                    value={form.trigger_phrase} 
                    onChange={e => setForm({ ...form, trigger_phrase: e.target.value })} 
                    placeholder="e.g. shipping"
                    className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-500 transition-all text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Category</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm({ ...form, category: e.target.value })} 
                    className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-500 transition-all text-sm font-bold appearance-none"
                  >
                    <option>General</option>
                    <option>Sales</option>
                    <option>Support</option>
                    <option>Logistics</option>
                    <option>Billing</option>
                    <option>Greeting</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Automated Response</label>
                <textarea 
                  required
                  value={form.response} 
                  onChange={e => setForm({ ...form, response: e.target.value })} 
                  placeholder="The chatbot will reply with this message..."
                  className="w-full bg-[#07101F] border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-500 transition-all text-sm font-bold min-h-[120px] resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest active:scale-[0.98]"
              >
                <CheckCircle2 size={20} />
                Deploy Response
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const Edit = ({ size }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
